#!/usr/bin/env python3
"""Mede as premissas da calculadora de aposentadoria. Uso: python3 -I medir.py
Stdlib apenas. Dados brutos ficam em um diretorio temporario (fora do repo)."""
import csv, io, json, re, statistics, sys, tempfile, urllib.request, zipfile
from datetime import date

csv.field_size_limit(sys.maxsize)
CVM = "https://dados.cvm.gov.br/dados"
BANCOS = re.compile(r"\bBB\b|ITA[UÚ]|BRADESCO|CAIXA|SANTANDER", re.I)
CLASSES = {"Renda Fixa", "Multimercado"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "medir-premissas/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def get_mes(url):
    """404 = mes ainda nao publicado (None); qualquer outro erro HTTP para a execucao."""
    try:
        return get(url)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise SystemExit(f"HTTP {e.code} ao baixar {url}")


def rows(raw):
    return csv.DictReader(io.StringIO(raw.decode("latin1")), delimiter=";")


def zip_csv(raw, name):
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        return z.read(name)


def r_real():
    def serie(n):
        u = (f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{n}/dados?formato=json"
             "&dataInicial=01/01/2006&dataFinal=31/12/2025")
        return {d["data"][3:]: float(d["valor"]) / 100 for d in json.loads(get(u))}
    cdi, ipca = serie(4391), serie(433)
    meses = sorted(set(cdi) & set(ipca), key=lambda m: (m[3:], m[:2]))
    assert len(meses) == 240, f"esperava 240 meses, veio {len(meses)}"
    f = 1.0
    for m in meses:
        f *= (1 + cdi[m]) / (1 + ipca[m])
    return f ** (12 / len(meses)) - 1, len(meses)


def meses_anteriores(n):
    h = date.today()
    out = []
    for i in range(1, n + 1):
        y, m = h.year, h.month - i
        while m <= 0:
            y, m = y - 1, m + 12
        out.append(f"{y}{m:02d}")
    return out


def taxa(s):
    try:
        return float(s.replace(",", "."))
    except ValueError:
        return None


def mediana_pond(pares):
    """Mediana ponderada: menor valor cujo peso acumulado alcanca metade do total."""
    pares = sorted(pares)
    tot, acc = sum(w for _, w in pares), 0.0
    for v, w in pares:
        acc += w
        if acc >= tot / 2:
            return v


def informe_diario():
    """Cotistas e PL por classe na ultima data do informe diario mais recente (soma das subclasses)."""
    for m in [date.today().strftime("%Y%m")] + meses_anteriores(2):
        z = get_mes(f"{CVM}/FI/DOC/INF_DIARIO/DADOS/inf_diario_fi_{m}.zip")
        if z is None:
            continue
        ult = {}  # cnpj -> {data: [cotistas, pl]}
        for r in rows(zip_csv(z, f"inf_diario_fi_{m}.csv")):
            c = re.sub(r"\D", "", r["CNPJ_FUNDO_CLASSE"])
            a = ult.setdefault(c, {}).setdefault(r["DT_COMPTC"], [0.0, 0.0])
            a[0] += taxa(r["NR_COTST"]) or 0
            a[1] += taxa(r["VL_PATRIM_LIQ"]) or 0
        return m, {c: d[max(d)] for c, d in ult.items()}
    raise SystemExit("informe diario indisponivel")


def fundos_fi():
    reg = get(f"{CVM}/FI/CAD/DADOS/registro_fundo_classe.zip")
    adm = {r["ID_Registro_Fundo"]: r["Administrador"]
           for r in rows(zip_csv(reg, "registro_fundo.csv"))}
    alvo = {}  # cnpj -> (administrador, classificacao)
    for r in rows(zip_csv(reg, "registro_classe.csv")):
        a = adm.get(r["ID_Registro_Fundo"], "")
        if (r["Situacao"] == "Em Funcionamento Normal" and r["Classificacao"] in CLASSES
                and r["Publico_Alvo"] == "Público Geral" and BANCOS.search(a)):
            alvo[r["CNPJ_Classe"]] = (a, r["Classificacao"])
    # So laminas (12 meses; documento do fundo vendido ao varejo). Linha mais recente por classe;
    # TAXA_ADM e PR_PL_DESPESA (despesas/PL, custo total) vem da mesma linha.
    melhor = {}  # cnpj -> (data, taxa_adm, despesa)
    vistas = {}  # classe elegivel presente nas laminas -> teve alguma taxa valida (0 < t <= 10)?
    for m in meses_anteriores(12):
        z = get_mes(f"{CVM}/FI/DOC/LAMINA/DADOS/lamina_fi_{m}.zip")
        if z is None:
            continue
        for r in rows(zip_csv(z, f"lamina_fi_{m}.csv")):
            c, t = re.sub(r"\D", "", r["CNPJ_FUNDO_CLASSE"]), taxa(r["TAXA_ADM"])
            if c in alvo:
                vistas[c] = vistas.get(c, 0) or (t is not None and 0 < t <= 10)
            if c in alvo and t is not None and 0 < t <= 10 and (c not in melhor or r["DT_COMPTC"] >= melhor[c][0]):
                melhor[c] = (r["DT_COMPTC"], t, taxa(r["PR_PL_DESPESA"]))
    mes, inf = informe_diario()
    sai = {"excluidas": sum(1 for ok in vistas.values() if not ok), "vistas": len(vistas),
           "classes_alvo": len(alvo), "com_taxa": len(melhor), "informe": mes,
           "com_informe": sum(1 for c in melhor if c in inf and inf[c][0] > 0),
           "adm": sorted({v[0] for v in alvo.values()}),
           "por_classe": {k: sum(1 for c in melhor if alvo[c][1] == k) for k in CLASSES}}
    for nome, i in (("TAXA_ADM", 1), ("PR_PL_DESPESA", 2)):
        base = {c: v for c, v in melhor.items() if v[i] is not None}
        com = {c: v for c, v in base.items() if c in inf and inf[c][0] > 0}
        sai[nome] = {
            "n": len(base), "n_pond": len(com),
            "mediana": statistics.median(v[i] for v in base.values()) / 100,
            "por_cotista": mediana_pond([(v[i], inf[c][0]) for c, v in com.items()]) / 100,
            "por_pl": mediana_pond([(v[i], inf[c][1]) for c, v in com.items()]) / 100,
        }
    return sai


def fie():
    # FIE = fundos estruturados (FIDC, FIP...): so balancete/balanco e medidas, sem taxa nem administrador.
    meta = get(f"{CVM}/FIE/MEDIDAS/META/meta_medidas_mes_fie.txt").decode("latin1")
    campos = re.findall(r"Campo: (\w+)", meta)
    assert not any("TAXA" in c or "ADMIN" in c for c in campos), campos
    return campos


if __name__ == "__main__":
    rr, n = r_real()
    print(f"rReal = {rr:.4f}  ({n} meses, CDI 4391 / IPCA 433, 2006-2025)")
    f = fundos_fi()
    print(f"classes elegiveis={f['classes_alvo']}  com TAXA_ADM na lamina={f['com_taxa']}  por classe={f['por_classe']}")
    print(f"classes de lamina sem taxa valida (zero, vazia ou >10%) excluidas: {f['excluidas']} de {f['vistas']}")
    print(f"informe diario {f['informe']}: {f['com_informe']} classes casadas por CNPJ_FUNDO_CLASSE (cotistas>0)")
    for k in ("TAXA_ADM", "PR_PL_DESPESA"):
        d = f[k]
        print(f"{k}: n={d['n']} (ponderadas {d['n_pond']})  mediana={d['mediana']:.4f}  por cotistas={d['por_cotista']:.4f}  por PL={d['por_pl']:.4f}")
    print("administradores casados:", *f["adm"], sep="\n   ")
    print("FIE: campos =", fie(), "-> sem taxa de administracao; fora da mediana")
