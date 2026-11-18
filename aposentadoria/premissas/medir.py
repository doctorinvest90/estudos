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


def fundos_fi():
    with tempfile.TemporaryDirectory() as _tmp:  # nada de bruto no repo
        reg = get(f"{CVM}/FI/CAD/DADOS/registro_fundo_classe.zip")
        adm = {r["ID_Registro_Fundo"]: r["Administrador"]
               for r in rows(zip_csv(reg, "registro_fundo.csv"))}
        alvo = {}  # cnpj -> administrador
        for r in rows(zip_csv(reg, "registro_classe.csv")):
            a = adm.get(r["ID_Registro_Fundo"], "")
            if (r["Situacao"] == "Em Funcionamento Normal" and r["Classificacao"] in CLASSES
                    and r["Publico_Alvo"] == "Público Geral" and BANCOS.search(a)):
                alvo[r["CNPJ_Classe"]] = (a, r["Classificacao"])
        # taxa mais recente por classe, so das laminas dos ultimos 12 meses (a lamina e o documento
        # do fundo distribuido ao varejo; o extrato inclui fundos fechados e sem lamina, e puxa a mediana a ~0,1%)
        melhor = {}  # cnpj -> (data, lamina, taxa)

        def considera(cnpj, dt, t, lam):
            cnpj = re.sub(r"\D", "", cnpj)
            if cnpj in alvo and t is not None and 0 < t <= 10:
                k = (dt, lam)
                if cnpj not in melhor or k > melhor[cnpj][:2]:
                    melhor[cnpj] = (dt, lam, t)

        for m in meses_anteriores(12):
            try:
                z = get(f"{CVM}/FI/DOC/LAMINA/DADOS/lamina_fi_{m}.zip")
            except urllib.error.HTTPError:
                continue
            for r in rows(zip_csv(z, f"lamina_fi_{m}.csv")):
                considera(r["CNPJ_FUNDO_CLASSE"], r["DT_COMPTC"], taxa(r["TAXA_ADM"]), True)
    t = [v[2] for v in melhor.values()]
    por_classe = {k: sum(1 for c in melhor if alvo[c][1] == k) for k in CLASSES}
    return statistics.median(t) / 100, len(alvo), len(t), sorted({v[0] for v in alvo.values()}), por_classe


def fie():
    # FIE = fundos estruturados (FIDC, FIP...): so balancete/balanco e medidas, sem taxa nem administrador.
    meta = get(f"{CVM}/FIE/MEDIDAS/META/meta_medidas_mes_fie.txt").decode("latin1")
    campos = re.findall(r"Campo: (\w+)", meta)
    assert not any("TAXA" in c or "ADMIN" in c for c in campos), campos
    return campos


if __name__ == "__main__":
    rr, n = r_real()
    print(f"rReal = {rr:.4f}  ({n} meses, CDI 4391 / IPCA 433, 2006-2025)")
    med, n_cls, n_tx, nomes, por_classe = fundos_fi()
    print(f"fundos (FI) = {med:.4f}  classes elegiveis={n_cls}  com taxa na lamina={n_tx}  por classe={por_classe}")
    print("administradores casados:", len(nomes))
    for a in nomes:
        print("  ", a)
    print("FIE: campos =", fie(), "-> sem taxa de administracao; fora da mediana")
