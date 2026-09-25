#!/usr/bin/env python3
"""Séries diárias desde 2000 para o teste de estresse da carteira (estresse/index.html).

Fontes: Banco Central (dólar PTAX venda e CDI), B3 (Ibovespa e IFIX) e Yahoo (S&P 500
com dividendos). Só grava o dados.json se a conferência passar; se falhar, sai com erro
e o arquivo anterior continua publicado.

Uso:
  python3 estresse/gera_dados.py [--out CAMINHO]
  python3 estresse/gera_dados.py --selftest
"""
import argparse
import base64
import datetime as dt
import json
import math
import os
import sys
import time
import urllib.request
from pathlib import Path

INICIO = "2000-01-03"                 # primeiro dia útil de 2000 (câmbio flutuante desde 1999)
BAIXA_DESDE = dt.date(1999, 12, 1)    # um mês antes, para o preenchimento pelo último valor
TOLERANCIA_PP = 0.3
FRESCOR_DIAS = 10
BURACO_DIAS = 10
UA = {"User-Agent": "Mozilla/5.0"}

# Retorno anual oficial (último valor até 31/12 sobre o do ano anterior), em %.
CONFERENCIA = {
    "acoes": {2002: -17.01, 2008: -41.22, 2015: -13.31, 2022: 4.69},
    "usd": {2002: 52.27, 2008: 31.94, 2015: 47.01, 2020: 28.93},
    "rf": {2008: 12.38, 2015: 13.24, 2022: 12.39},
    "spx": {2002: -22.10, 2008: -37.00, 2022: -18.11},
    "fii": {2020: -10.24, 2022: 2.22},
}

FONTES = {
    "ext": "S&P 500 com dividendos (Yahoo, ^SP500TR), convertido pelo dólar PTAX venda (Banco Central, SGS 1)",
    "rf": "CDI (Banco Central, SGS 12)",
    "acoes": "Ibovespa (B3)",
    "fii": "IFIX (B3), desde 30/12/2010",
}


# ---------------------------------------------------------------- funções puras

def numero_br(s):
    """'1.354,08' -> 1354.08"""
    return float(s.strip().replace(".", "").replace(",", "."))


def ler_csv_b3(txt, ano):
    """CSV da B3 (Dia;Jan;...;Dez) -> {data ISO: valor}. Linhas sem dia numérico são ignoradas."""
    out = {}
    for linha in txt.splitlines():
        c = linha.split(";")
        if not c[0].strip().isdigit():
            continue
        dia = int(c[0])
        for mes in range(1, 13):
            if len(c) > mes and c[mes].strip():
                out[f"{ano}-{mes:02d}-{dia:02d}"] = numero_br(c[mes])
    return out


def alinhar(calendario, serie):
    """Valor em cada data do calendário = último disponível até ela; None antes do primeiro."""
    chaves = sorted(serie)
    out, j, ultimo = [], 0, None
    for d in calendario:
        while j < len(chaves) and chaves[j] <= d:
            ultimo = serie[chaves[j]]
            j += 1
        out.append(ultimo)
    return out


def indice_cdi(calendario, taxas):
    """Índice base 100: cada dia útil rende a taxa (% ao dia) do dia útil anterior."""
    out = [100.0]
    for i in range(1, len(calendario)):
        out.append(out[-1] * (1 + taxas[calendario[i - 1]] / 100))
    return out


def base100(xs):
    """Normaliza para 100 no primeiro valor não nulo, com 6 algarismos significativos."""
    b = next(x for x in xs if x is not None)
    return [None if x is None else float(f"{x / b * 100:.6g}") for x in xs]


def retorno_ano(calendario, xs, ano):
    """Retorno do ano em %: último valor até 31/12 sobre o último até 31/12 do ano anterior."""
    def ultimo_ate(limite):
        for i in range(len(calendario) - 1, -1, -1):
            if calendario[i] <= limite and xs[i] is not None:
                return xs[i]
        return None
    a, b = ultimo_ate(f"{ano - 1}-12-31"), ultimo_ate(f"{ano}-12-31")
    return None if a is None or b is None else (b / a - 1) * 100


def montar(brutos):
    """brutos: cdi (taxas), usd, ibov, ifix, spx ({data ISO: valor}) -> (calendário, séries alinhadas)."""
    cal = [d for d in sorted(brutos["cdi"]) if d >= INICIO]
    usd = alinhar(cal, brutos["usd"])
    spx = alinhar(cal, brutos["spx"])
    return cal, {
        "usd": usd,
        "spx": spx,
        "ext": [None if s is None or u is None else s * u for s, u in zip(spx, usd)],
        "rf": indice_cdi(cal, brutos["cdi"]),
        "acoes": alinhar(cal, brutos["ibov"]),
        "fii": alinhar(cal, brutos["ifix"]),
    }


def conferir(cal, series, brutos, hoje, referencia=CONFERENCIA):
    """Lista de problemas, em português; vazia = pode publicar."""
    erros = []
    for chave, anos in referencia.items():
        for ano, esperado in anos.items():
            obtido = retorno_ano(cal, series[chave], ano)
            if obtido is None or abs(obtido - esperado) > TOLERANCIA_PP:
                txt = "sem dado" if obtido is None else f"{obtido:+.2f}%"
                erros.append(f"{chave} {ano}: esperado {esperado:+.2f}%, obtido {txt}")
    if not cal:
        return erros + ["calendário vazio"]
    if (hoje - dt.date.fromisoformat(cal[-1])).days > FRESCOR_DIAS:
        erros.append(f"calendário parou em {cal[-1]}")
    for nome, serie in brutos.items():
        ds = sorted(serie)
        if not ds:
            erros.append(f"{nome}: série vazia")
            continue
        if (hoje - dt.date.fromisoformat(ds[-1])).days > FRESCOR_DIAS:
            erros.append(f"{nome}: último dado em {ds[-1]}")
        for a, b in zip(ds, ds[1:]):
            if (dt.date.fromisoformat(b) - dt.date.fromisoformat(a)).days > BURACO_DIAS:
                erros.append(f"{nome}: buraco de {a} a {b}")
                break
    for k, xs in series.items():
        if len(xs) != len(cal):
            erros.append(f"{k}: {len(xs)} valores para {len(cal)} datas")
    for k in ("usd", "ext", "rf", "acoes"):
        if any(x is None for x in series[k]):
            erros.append(f"{k}: data sem valor")
    fii = series["fii"]
    primeiro = next((i for i, x in enumerate(fii) if x is not None), None)
    if primeiro is None or any(x is None for x in fii[primeiro:]):
        erros.append("fii: sem valor depois do início do IFIX")
    return erros


def empacotar(cal, series, agora):
    """Estrutura do dados.json: datas + uma lista por série, base 100 (dólar em reais)."""
    return {
        "gerado_em": agora,
        "ultima_data": cal[-1],
        "fontes": FONTES,
        "datas": cal,
        "usd": [round(x, 4) for x in series["usd"]],
        "ext": base100(series["ext"]),
        "rf": base100(series["rf"]),
        "acoes": base100(series["acoes"]),
        "fii": base100(series["fii"]),
    }


# ---------------------------------------------------------------- selftest

def selftest():
    assert numero_br("1.354,08") == 1354.08
    assert numero_br(" 109.734,60 ") == 109734.6
    csv = "IBOV - 2022\r\nDia;Jan;Fev\r\n\r\n1;;1.000,50\r\n3;104.822,44;\r\nMínimo;1;2\r\n"
    assert ler_csv_b3(csv, 2022) == {"2022-02-01": 1000.5, "2022-01-03": 104822.44}
    assert alinhar(["2000-01-01", "2000-01-02", "2000-01-05"],
                   {"2000-01-02": 5.0, "2000-01-04": 7.0}) == [None, 5.0, 7.0]
    idx = indice_cdi(["d1", "d2", "d3"], {"d1": 1.0, "d2": 2.0, "d3": 3.0})
    assert idx[:2] == [100.0, 101.0] and math.isclose(idx[2], 103.02)
    assert base100([None, 2.0, 3.0]) == [None, 100.0, 150.0]
    assert base100([3.0, 3.0000001]) == [100.0, 100.0]      # 6 algarismos significativos
    cal = ["2020-12-31", "2021-06-30", "2021-12-31"]
    assert math.isclose(retorno_ano(cal, [100.0, 105.0, 110.0], 2021), 10.0)
    assert retorno_ano(cal, [None, 105.0, 110.0], 2021) is None

    # montar: calendário = dias com CDI a partir de INICIO; o resto pelo último valor.
    cal3, s3 = montar({"cdi": {"1999-12-30": 0.1, "2000-01-03": 0.1, "2000-01-04": 0.1},
                       "usd": {"1999-12-30": 1.8, "2000-01-04": 2.0},
                       "spx": {"1999-12-31": 10.0, "2000-01-03": 11.0},
                       "ibov": {"2000-01-03": 17000.0},
                       "ifix": {}})
    assert cal3 == ["2000-01-03", "2000-01-04"]
    assert s3["ext"] == [11.0 * 1.8, 11.0 * 2.0]
    assert s3["fii"] == [None, None]
    assert math.isclose(s3["rf"][1], 100.1)

    # conferir: passa dentro da tolerância; falha fora dela, com dado velho, buraco ou FII nulo.
    brutos = {"cdi": {"2021-12-30": 0.01, "2021-12-31": 0.01}, "usd": {"2021-12-30": 5.0},
              "ibov": {"2021-12-31": 1.0}, "ifix": {"2021-12-30": 2.0}, "spx": {"2021-12-30": 3.0}}
    hoje = dt.date(2022, 1, 5)
    cal2 = ["2020-12-31", "2021-12-31"]
    series = {"usd": [5.0, 5.5], "spx": [1.0, 1.1], "ext": [5.0, 6.05], "rf": [100.0, 110.0],
              "acoes": [100.0, 90.0], "fii": [None, 2.0]}
    assert conferir(cal2, series, brutos, hoje, {"acoes": {2021: -10.0}, "rf": {2021: 10.2}}) == []
    erros = conferir(cal2, series, brutos, hoje, {"acoes": {2021: -12.0}})
    assert erros == ["acoes 2021: esperado -12.00%, obtido -10.00%"], erros
    assert any("último dado" in e for e in conferir(cal2, series, brutos, dt.date(2022, 2, 1), {}))
    b2 = dict(brutos, spx={"2021-12-01": 3.0, "2021-12-30": 3.0})
    assert any("buraco" in e for e in conferir(cal2, series, b2, hoje, {}))
    assert any(e.startswith("fii") for e in conferir(cal2, dict(series, fii=[2.0, None]), brutos, hoje, {}))

    d = empacotar(cal2, series, "2022-01-05T12:00:00Z")
    assert d["ultima_data"] == "2021-12-31" and d["acoes"] == [100.0, 90.0] and d["fii"] == [None, 100.0]

    # baixar: corpo que não se deixa ler (o Banco Central às vezes responde 200 vazio) conta
    # como falha e tenta de novo; esgotadas as tentativas, o erro sobe com a URL.
    respostas = [b"", b"[1]"]
    assert baixar("x", ler=json.loads, abrir=lambda url: respostas.pop(0), espera=0) == [1]
    assert respostas == []
    try:
        baixar("x", tentativas=2, ler=json.loads, abrir=lambda url: b"", espera=0)
        raise AssertionError("deveria ter falhado")
    except RuntimeError as e:
        assert "falha ao baixar x" in str(e)


# ---------------------------------------------------------------- rede

def _abrir(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def baixar(url, tentativas=3, ler=None, abrir=_abrir, espera=3):
    """Baixa e interpreta com `ler`. Resposta que não se deixa ler conta como falha de rede:
    o Banco Central às vezes responde 200 com corpo vazio."""
    for n in range(tentativas):
        try:
            corpo = abrir(url)
            return ler(corpo) if ler else corpo
        except Exception as e:  # rede ou conteúdo inválido: nova tentativa; a última propaga
            if n == tentativas - 1:
                raise RuntimeError(f"falha ao baixar {url}: {e}") from e
            time.sleep(espera * (n + 1))


def bcb(serie, inicio, fim):
    """Série diária do SGS. O Banco Central aceita no máximo 10 anos por consulta."""
    out, a = {}, inicio
    while a <= fim:
        b = min(dt.date(a.year + 9, 12, 31), fim)
        url = (f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados?formato=json"
               f"&dataInicial={a:%d/%m/%Y}&dataFinal={b:%d/%m/%Y}")
        for row in baixar(url, ler=json.loads):
            d, m, y = row["data"].split("/")
            out[f"{y}-{m}-{d}"] = float(row["valor"])
        a = b + dt.timedelta(days=1)
    return out


def b3(indice, ano_ini, ano_fim):
    """Fechamentos diários oficiais de um índice da B3, ano a ano."""
    out = {}
    for ano in range(ano_ini, ano_fim + 1):
        p = base64.b64encode(json.dumps({"index": indice, "language": "pt-br", "year": str(ano)}).encode()).decode()
        url = f"https://sistemaswebb3-listados.b3.com.br/indexStatisticsProxy/IndexCall/GetDownloadPortfolioDay/{p}"
        csv = baixar(url, ler=lambda b: base64.b64decode(b, validate=True).decode("latin-1"))
        out.update(ler_csv_b3(csv, ano))
    return out


def yahoo(simbolo, inicio, fim):
    """Fechamentos diários do Yahoo (a data vem do horário de abertura, em UTC)."""
    p1 = int(dt.datetime(inicio.year, inicio.month, inicio.day, tzinfo=dt.timezone.utc).timestamp())
    p2 = int(dt.datetime(fim.year, fim.month, fim.day, tzinfo=dt.timezone.utc).timestamp()) + 86400
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{simbolo}?interval=1d&period1={p1}&period2={p2}"
    r = baixar(url, ler=lambda b: json.loads(b)["chart"]["result"][0])
    fechamentos = r["indicators"]["quote"][0]["close"]
    return {dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime("%Y-%m-%d"): c
            for t, c in zip(r["timestamp"], fechamentos) if c is not None}


def baixar_tudo(hoje):
    return {
        "cdi": bcb(12, BAIXA_DESDE, hoje),
        "usd": bcb(1, BAIXA_DESDE, hoje),
        "ibov": b3("IBOV", BAIXA_DESDE.year, hoje.year),
        "ifix": b3("IFIX", 2010, hoje.year),
        "spx": yahoo("%5ESP500TR", BAIXA_DESDE, hoje),
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description="Gera estresse/dados.json (teste de estresse da carteira).")
    ap.add_argument("--out", default=str(Path(__file__).with_name("dados.json")))
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args(argv)
    if args.selftest:
        selftest()
        print("selftest ok")
        return 0
    hoje = dt.date.today()
    brutos = baixar_tudo(hoje)
    cal, series = montar(brutos)
    erros = conferir(cal, series, brutos, hoje)
    if erros:
        print("Conferência falhou; dados.json não foi alterado:", file=sys.stderr)
        for e in erros:
            print("  - " + e, file=sys.stderr)
        return 1
    agora = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    dados = empacotar(cal, series, agora)
    tmp = Path(args.out + ".tmp")
    tmp.write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    os.replace(tmp, args.out)
    print(f"ok: {len(cal)} datas, de {cal[0]} a {cal[-1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
