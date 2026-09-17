# -*- coding: utf-8 -*-
"""
Motor do estudo "Monitor de dividendos" — Doctor Invest, set/2026.
Lei 15.270/2025: retenção de 10% (>R$50 mil/mês por PJ) + IRPFM (renda > R$600 mil/ano).

Convenções: tudo anual, ano-calendário 2026, valores nominais salvo indicação.
Todas as premissas foram definidas ANTES de rodar o primeiro resultado.
"""
from dataclasses import dataclass, field, asdict
import copy

# ------------------------------------------------------------------ parâmetros legais
IRPFM_PISO = 600_000.0        # abaixo: alíquota zero
IRPFM_TETO = 1_200_000.0      # acima: 10% fixo
IRPFM_MAX = 0.10
RET_DIV_LIMITE_MES = 50_000.0 # gatilho da retenção mensal por PJ pagadora
RET_DIV_ALIQ = 0.10
REDUTOR_TETO_PJ_GERAL = 0.34  # art. 16-B: carga PJ+PF acima disso gera redutor

# Tabela progressiva anual (12x mensal vigente desde mai/2025, mantida pela Lei 15.270)
TABELA_IRPF = [  # (limite superior da faixa, alíquota, parcela a deduzir)
    (29_145.60, 0.000,      0.00),
    (33_919.80, 0.075,  2_185.92),
    (45_012.60, 0.150,  4_729.92),
    (55_976.16, 0.225,  8_105.88),
    (float("inf"), 0.275, 10_904.76),
]

# Lucro presumido — serviços médicos
PRESUNCAO = 0.32
IRPJ = 0.15
IRPJ_ADIC = 0.10
IRPJ_ADIC_LIMITE_ANO = 240_000.0   # R$ 60 mil/trimestre
CSLL = 0.09
PIS_COFINS = 0.0365
ISS = 0.02                          # São Paulo (varia de 2% a 5% por município)

# INSS 2026 (Portaria MPS/MF 13/2026)
TETO_INSS_MES = 8_475.55
INSS_SEGURADO = 0.11
INSS_PATRONAL = 0.20

# Mercado (set/2026) — parâmetros, não previsões
CDI = 0.1365        # Selic 13,75% (Copom set/26); CDI ~13,65%
IPCA = 0.045         # meio-termo entre Focus 2026 (~5%) e 2027 (~4,2%)
IR_RF_LONGO = 0.15   # renda fixa tributada, prazo > 2 anos
LCI_PCT_CDI = 0.88   # LCI/LCA/CRI típicos: 85–90% do CDI
DY_ACOES = 0.05      # dividendos de ações Brasil
DY_FII = 0.10        # distribuição de FII (isenta, fora da base)
ATRASO_RESTITUICAO_MESES = 11  # retenção mensal vs. restituição no ajuste seguinte


@dataclass
class Perfil:
    nome: str
    receita_mes: float
    patrimonio: float
    custos_pct: float = 0.08          # contabilidade, sistemas, seguro, sala
    prolabore_mes: float = TETO_INSS_MES
    # alocação da carteira de partida (soma 1)
    aloc_rf_trib: float = 0.60        # CDB, Tesouro, fundos
    aloc_isentos: float = 0.20        # LCI/LCA/CRI/CRA/debêntures incentivadas
    aloc_acoes: float = 0.12
    aloc_fii: float = 0.08
    pgbl_aporte: float = 0.0
    n_pjs: int = 1                    # quantas PJs pagam os dividendos
    outros_tributaveis: float = 0.0   # CLT, aluguéis, outros rendimentos na tabela progressiva


PERFIS = {
    "P1": Perfil("Consultório", 40_000, 600_000),
    "P2": Perfil("Consultório + plantões", 70_000, 1_200_000),
    "P3": Perfil("Sócio de grupo", 100_000, 2_000_000),
}


# ------------------------------------------------------------------ blocos de cálculo
def irpf_anual(base):
    """IR devido no ajuste anual sobre a base tributável (já líquida de deduções)."""
    if base <= 0:
        return 0.0
    for lim, aliq, ded in TABELA_IRPF:
        if base <= lim:
            return max(0.0, base * aliq - ded)
    return 0.0


def aliquota_irpfm(base):
    """Alíquota do imposto mínimo: linear de 0% (600 mil) a 10% (1,2 milhão)."""
    if base <= IRPFM_PISO:
        return 0.0
    if base >= IRPFM_TETO:
        return IRPFM_MAX
    return (base / 60_000.0 - 10.0) / 100.0


def marginal_irpfm(base):
    """Alíquota marginal do IRPFM bruto sobre o último real da base.
    T(B) = B²/6.000.000 − 0,1·B  →  T'(B) = B/3.000.000 − 0,1 (zona de transição)."""
    if base <= IRPFM_PISO:
        return 0.0
    if base >= IRPFM_TETO:
        return IRPFM_MAX
    return base / 3_000_000.0 - 0.10


def pj_presumido(receita_ano, custos_pct, prolabore_mes):
    """Tributos e lucro distribuível de uma PJ médica no lucro presumido."""
    base_ir = receita_ano * PRESUNCAO
    irpj = base_ir * IRPJ + max(0.0, base_ir - IRPJ_ADIC_LIMITE_ANO) * IRPJ_ADIC
    csll = base_ir * CSLL
    pis_cofins = receita_ano * PIS_COFINS
    iss = receita_ano * ISS
    tributos_pj = irpj + csll + pis_cofins + iss
    prolabore_ano = prolabore_mes * 12
    inss_patronal = prolabore_ano * INSS_PATRONAL
    custos = receita_ano * custos_pct
    lucro = receita_ano - tributos_pj - custos - prolabore_ano - inss_patronal
    return dict(receita=receita_ano, irpj=irpj, csll=csll, pis_cofins=pis_cofins, iss=iss,
                tributos_pj=tributos_pj, custos=custos, prolabore=prolabore_ano,
                inss_patronal=inss_patronal, lucro=max(0.0, lucro),
                aliq_efetiva_irpj_csll_sobre_lucro=(irpj + csll) / max(1.0, lucro))


def simular(p: Perfil, lei=True, prolabore_deducao_extra=0.0):
    """Simula um ano-calendário completo para um perfil. Retorna dicionário com tudo."""
    pj = pj_presumido(p.receita_mes * 12, p.custos_pct, p.prolabore_mes)
    dividendos = pj["lucro"]

    # --- pessoa física: pró-labore
    prolabore = pj["prolabore"]
    inss_seg = min(p.prolabore_mes, TETO_INSS_MES) * INSS_SEGURADO * 12
    pgbl = min(p.pgbl_aporte, 0.12 * (prolabore + p.outros_tributaveis))  # dedução limitada a 12% da renda tributável
    base_irpf = prolabore + p.outros_tributaveis - inss_seg - pgbl - prolabore_deducao_extra
    irpf = irpf_anual(base_irpf)

    # --- investimentos: rendimento realizado no ano
    rf_trib = p.patrimonio * p.aloc_rf_trib
    isentos = p.patrimonio * p.aloc_isentos
    acoes = p.patrimonio * p.aloc_acoes
    fii = p.patrimonio * p.aloc_fii
    rend_rf = rf_trib * CDI
    ir_rf = rend_rf * IR_RF_LONGO
    rend_isentos = isentos * CDI * LCI_PCT_CDI
    div_acoes = acoes * DY_ACOES
    rend_fii = fii * DY_FII

    # --- retenção mensal de 10% (por PJ pagadora)
    div_mes_por_pj = dividendos / 12 / max(1, p.n_pjs)
    retencao = dividendos * RET_DIV_ALIQ if (lei and div_mes_por_pj > RET_DIV_LIMITE_MES) else 0.0

    # --- IRPFM
    base_irpfm = prolabore + p.outros_tributaveis + dividendos + rend_rf + div_acoes  # FII e isentos ficam fora
    aliq = aliquota_irpfm(base_irpfm) if lei else 0.0
    irpfm_bruto = aliq * base_irpfm
    creditos = irpf + ir_rf + retencao
    irpfm_adicional = max(0.0, irpfm_bruto - creditos)
    # saldo do ajuste: retenção devolvida se sobrar
    restituicao = max(0.0, retencao - max(0.0, irpfm_bruto - irpf - ir_rf))
    imposto_pf_total = irpf + ir_rf + irpfm_adicional + (retencao - restituicao)
    # obs.: retencao - restituicao é a parte da retenção que ficou (igual ao que faltou no ajuste)
    # → imposto_pf_total = irpf + ir_rf + max(irpfm_bruto - irpf - ir_rf, 0)
    imposto_pf_total = irpf + ir_rf + max(0.0, irpfm_bruto - irpf - ir_rf)
    irpfm_liquido = max(0.0, irpfm_bruto - irpf - ir_rf)  # o que a lei realmente adiciona

    # custo de caixa da retenção: dinheiro parado até a restituição (ou até o ajuste)
    custo_caixa_retencao = retencao * CDI * (1 - IR_RF_LONGO) * ATRASO_RESTITUICAO_MESES / 12

    # marginal efetiva sobre o próximo real de cada tipo de renda
    m = marginal_irpfm(base_irpfm) if lei else 0.0
    binding = lei and irpfm_bruto > (irpf + ir_rf)
    marg_dividendo = m if binding else 0.0
    marg_rf_trib = m if binding else IR_RF_LONGO
    marg_isento = 0.0
    # até onde a LCI pode ceder rendimento e ainda empatar com CDB a 100% do CDI
    lci_breakeven_pct_cdi = 1 - marg_rf_trib

    # redutor art. 16-B: carga PJ+PF sobre o mesmo lucro
    carga_pj = pj["aliq_efetiva_irpj_csll_sobre_lucro"]
    carga_combinada = carga_pj + aliq
    redutor_aplica = carga_combinada > REDUTOR_TETO_PJ_GERAL

    renda_bruta_total = prolabore + p.outros_tributaveis + dividendos + rend_rf + rend_isentos + div_acoes + rend_fii
    imposto_total = pj["irpj"] + pj["csll"] + imposto_pf_total  # sem PIS/COFINS/ISS (não são sobre renda)

    return dict(
        perfil=p.nome, lei=lei, **pj,
        dividendos=dividendos, div_mes=dividendos / 12,
        inss_seg=inss_seg, pgbl=pgbl, base_irpf=base_irpf, irpf=irpf,
        rend_rf=rend_rf, ir_rf=ir_rf, rend_isentos=rend_isentos, div_acoes=div_acoes, rend_fii=rend_fii,
        base_irpfm=base_irpfm, aliq_irpfm=aliq, irpfm_bruto=irpfm_bruto, creditos=creditos,
        retencao=retencao, restituicao=restituicao, irpfm_liquido=irpfm_liquido,
        custo_caixa_retencao=custo_caixa_retencao,
        imposto_pf_total=imposto_pf_total, imposto_total=imposto_total,
        renda_bruta_total=renda_bruta_total,
        carga_efetiva_total=imposto_total / renda_bruta_total,
        marginal_bruta=m, binding=binding,
        marg_dividendo=marg_dividendo, marg_rf_trib=marg_rf_trib, marg_isento=marg_isento,
        lci_breakeven_pct_cdi=lci_breakeven_pct_cdi,
        carga_pj=carga_pj, carga_combinada=carga_combinada, redutor_aplica=redutor_aplica,
        dist_piso=IRPFM_PISO - base_irpfm,
    )


def base_onde_morde(p: Perfil):
    """Base a partir da qual o IRPFM bruto supera os créditos (IRPF + IR RF): busca binária
    escalando apenas os dividendos."""
    s = simular(p)
    cred = s["irpf"] + s["ir_rf"]
    lo, hi = IRPFM_PISO, 3_000_000.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if aliquota_irpfm(mid) * mid > cred:
            hi = mid
        else:
            lo = mid
    return hi


def erosao(p: Perfil, anos=11, ipca=IPCA):
    """Segunda janela: mesma renda REAL por 'anos' anos, lei sem correção. Resultado em R$ de 2026."""
    out = []
    for t in range(anos):
        q = copy.deepcopy(p)
        f = (1 + ipca) ** t
        q.receita_mes *= f
        q.patrimonio *= f
        # pró-labore no teto do INSS, que é corrigido pelo INPC — mantido em termos reais
        q.prolabore_mes *= f
        q.outros_tributaveis *= f
        q.pgbl_aporte *= f
        s = simular(q)
        # tabela do IRPF também fica congelada no modelo (é o que a lei diz hoje)
        out.append(dict(ano=2026 + t, fator=f, base_nominal=s["base_irpfm"],
                        aliq=s["aliq_irpfm"], irpfm_nominal=s["irpfm_liquido"],
                        irpfm_real=s["irpfm_liquido"] / f, marginal=s["marginal_bruta"],
                        binding=s["binding"]))
    return out


def pgbl_vs_vgbl(p: Perfil, aporte=None, anos=10, retorno=None):
    """Compara aporte em PGBL (dedutível, resgate tributa tudo) com VGBL (sem dedução,
    resgate tributa só o ganho). Regime regressivo, 10% após 10 anos."""
    limite = 0.12 * (p.prolabore_mes * 12 + p.outros_tributaveis)
    if aporte is None:
        aporte = min(p.pgbl_aporte, limite) if p.pgbl_aporte > 0 else limite
    if retorno is None:
        retorno = (1 + IPCA) * 1.06 - 1  # IPCA + 6% nominal
    sem = copy.deepcopy(p); sem.pgbl_aporte = 0.0; sem = simular(sem)
    q = copy.deepcopy(p); q.pgbl_aporte = aporte
    com = simular(q)
    economia_irpf = sem["irpf"] - com["irpf"]
    devolvido_irpfm = com["irpfm_liquido"] - sem["irpfm_liquido"]
    beneficio_liquido_hoje = economia_irpf - devolvido_irpfm
    saldo = aporte * (1 + retorno) ** anos
    ir_pgbl = saldo * 0.10
    ir_vgbl = (saldo - aporte) * 0.10
    # valor presente do custo extra no resgate, descontado à mesma taxa
    custo_extra_resgate_vp = (ir_pgbl - ir_vgbl) / (1 + retorno) ** anos  # = 10% do aporte
    return dict(aporte=aporte, economia_irpf=economia_irpf, devolvido_irpfm=devolvido_irpfm,
                beneficio_liquido_hoje=beneficio_liquido_hoje,
                custo_extra_resgate_vp=custo_extra_resgate_vp,
                resultado_pgbl_vs_vgbl=beneficio_liquido_hoje - custo_extra_resgate_vp,
                binding=sem["binding"], binding_com=com["binding"])


def curva_realocacao(p: Perfil, passos=21):
    """Move renda fixa tributada para isentos, de 0% a 100% do bloco de RF."""
    out = []
    total_rf = p.aloc_rf_trib + p.aloc_isentos
    for i in range(passos):
        frac = i / (passos - 1)
        q = copy.deepcopy(p)
        q.aloc_isentos = total_rf * frac
        q.aloc_rf_trib = total_rf * (1 - frac)
        s = simular(q)
        rend_liq = (s["rend_rf"] - s["ir_rf"] + s["rend_isentos"] - s["irpfm_liquido"])
        out.append(dict(frac_isentos=frac, base=s["base_irpfm"], irpfm=s["irpfm_liquido"],
                        ir_rf=s["ir_rf"], rend_liq_rf=rend_liq, marginal=s["marginal_bruta"],
                        binding=s["binding"], lci_be=s["lci_breakeven_pct_cdi"]))
    return out


if __name__ == "__main__":
    for k, p in PERFIS.items():
        s = simular(p); s0 = simular(p, lei=False)
        print(f"\n== {k} {p.nome} — receita R$ {p.receita_mes:,.0f}/mês, patrimônio R$ {p.patrimonio:,.0f}")
        for c in ["tributos_pj", "lucro", "div_mes", "irpf", "rend_rf", "ir_rf", "div_acoes",
                  "base_irpfm", "aliq_irpfm", "irpfm_bruto", "creditos", "retencao", "restituicao",
                  "irpfm_liquido", "custo_caixa_retencao", "marginal_bruta", "binding",
                  "marg_dividendo", "marg_rf_trib", "lci_breakeven_pct_cdi", "carga_pj",
                  "carga_combinada", "redutor_aplica", "imposto_total", "carga_efetiva_total"]:
            v = s[c]
            print(f"  {c:26s} {v:>14,.4f}" if isinstance(v, float) else f"  {c:26s} {v}")
        print(f"  imposto_total sem lei      {s0['imposto_total']:>14,.0f}  → com lei {s['imposto_total']:,.0f}")
        print(f"  base onde morde            {base_onde_morde(p):>14,.0f}")
        print("  pgbl:", {k2: round(v, 0) if isinstance(v, float) else v for k2, v in pgbl_vs_vgbl(p).items()})
        for e in erosao(p)[::5]:
            print("  erosão", e["ano"], f"base {e['base_nominal']:,.0f} aliq {e['aliq']:.3%} irpfm real {e['irpfm_real']:,.0f}")
