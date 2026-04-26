"""
Geração de relatórios em PDF com ReportLab.
Formato profissional para envio a escolas e secretarias.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os

PRIMARY = colors.HexColor("#1a3c5e")
ACCENT = colors.HexColor("#e8a217")
LIGHT = colors.HexColor("#f4f6f9")


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("T", parent=base["Heading1"], textColor=PRIMARY,
                                alignment=TA_CENTER, fontSize=18, spaceAfter=4),
        "subtitle": ParagraphStyle("S", parent=base["Normal"], textColor=colors.grey,
                                   alignment=TA_CENTER, fontSize=10, spaceAfter=4),
        "section": ParagraphStyle("H", parent=base["Heading2"], textColor=PRIMARY,
                                  fontSize=12, spaceBefore=14, spaceAfter=6),
        "body": ParagraphStyle("B", parent=base["Normal"], fontSize=9, spaceAfter=4),
        "note": ParagraphStyle("N", parent=base["Normal"], textColor=colors.grey,
                               fontSize=8, alignment=TA_CENTER, spaceBefore=10),
    }


def generate_monthly_report(
    school_name: str,
    class_name: str,
    month: str,
    students_data: list,
    output_path: str,
) -> str:
    """
    Gera relatório mensal da turma em PDF.

    students_data: lista de dicts com keys:
        name, level, games_played, puzzles_solved,
        opening_accuracy, middlegame_accuracy, endgame_accuracy,
        blunders, mistakes, recurring_pattern
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.5*cm, rightMargin=2.5*cm)
    st = _styles()
    story = []

    # Cabeçalho
    story += [
        Paragraph("Plataforma de Xadrez Escolar", st["title"]),
        Paragraph(f"Relatório Mensal — {month}", st["subtitle"]),
        Paragraph(f"{school_name}  |  {class_name}", st["subtitle"]),
        Spacer(1, 0.3*cm),
        HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=10),
    ]

    # Tabela de evolução
    story.append(Paragraph("Evolução dos Alunos", st["section"]))

    header = ["Aluno", "Nível", "Partidas", "Puzzles", "Aber.", "Meio", "Final", "Erros gr."]
    rows = [header]
    for s in students_data:
        rows.append([
            s.get("name", "—"),
            s.get("level", "Peão"),
            str(s.get("games_played", 0)),
            str(s.get("puzzles_solved", 0)),
            f"{s['opening_accuracy']:.1f}%" if s.get("opening_accuracy") else "—",
            f"{s['middlegame_accuracy']:.1f}%" if s.get("middlegame_accuracy") else "—",
            f"{s['endgame_accuracy']:.1f}%" if s.get("endgame_accuracy") else "—",
            str(s.get("blunders", 0)),
        ])

    col_w = [4.5*cm, 2*cm, 1.8*cm, 1.8*cm, 1.8*cm, 1.8*cm, 1.8*cm, 1.8*cm]
    tbl = Table(rows, colWidths=col_w)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWHEIGHT", (0, 0), (-1, -1), 0.65*cm),
    ]))
    story += [tbl, Spacer(1, 0.4*cm)]

    # Padrões de erro
    patterns = [(s["name"], s["recurring_pattern"])
                for s in students_data if s.get("recurring_pattern")]
    if patterns:
        story.append(Paragraph("Padrões de Erro Identificados", st["section"]))
        pat_rows = [["Aluno", "Padrão recorrente"]]
        for name, pat in patterns:
            pat_rows.append([name, pat])
        pt = Table(pat_rows, colWidths=[5*cm, 10.5*cm])
        pt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWHEIGHT", (0, 0), (-1, -1), 0.65*cm),
        ]))
        story += [pt, Spacer(1, 0.4*cm)]

    # Nota metodológica
    story += [
        HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
        Paragraph(
            "Este relatório foi gerado automaticamente pela Plataforma de Xadrez Escolar. "
            "A análise de partidas utiliza o motor Stockfish (open source) e segue a "
            "metodologia de superação pessoal — os dados refletem a evolução individual "
            "de cada aluno em relação ao próprio histórico, sem comparação entre pares.",
            st["body"],
        ),
        Paragraph(
            f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')} | "
            "Conforme LGPD, ECA e Lei Fléxa (Lei 14.460/2022)",
            st["note"],
        ),
    ]

    doc.build(story)
    return output_path


def generate_student_report(
    student_name: str,
    school_name: str,
    class_name: str,
    student_data: dict,
    output_path: str,
) -> str:
    """Relatório individual de evolução do aluno."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.5*cm, rightMargin=2.5*cm)
    st = _styles()
    story = []

    story += [
        Paragraph("Plataforma de Xadrez Escolar", st["title"]),
        Paragraph(f"Relatório Individual — {student_name}", st["subtitle"]),
        Paragraph(f"{school_name}  |  {class_name}", st["subtitle"]),
        Spacer(1, 0.3*cm),
        HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=10),
    ]

    # Resumo
    story.append(Paragraph("Resumo Geral", st["section"]))
    summary = [
        ["Nível atual", student_data.get("level", "Peão")],
        ["Partidas jogadas", str(student_data.get("games_played", 0))],
        ["Puzzles resolvidos", str(student_data.get("puzzles_solved", 0))],
        ["Username Lichess", student_data.get("lichess_username") or "—"],
    ]
    st2 = Table(summary, colWidths=[6*cm, 9.5*cm])
    st2.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWHEIGHT", (0, 0), (-1, -1), 0.65*cm),
    ]))
    story += [st2, Spacer(1, 0.4*cm)]

    # Mapa do jogo
    story.append(Paragraph("Mapa do Jogo — Acurácia por Fase", st["section"]))
    acc = [
        ["Fase", "Acurácia", "Erros graves", "Erros", "Imprecisões"],
        ["Abertura",
         f"{student_data.get('opening_accuracy', 0):.1f}%" if student_data.get("opening_accuracy") else "—",
         "—", "—", "—"],
        ["Meio-jogo",
         f"{student_data.get('middlegame_accuracy', 0):.1f}%" if student_data.get("middlegame_accuracy") else "—",
         str(student_data.get("blunders", 0)),
         str(student_data.get("mistakes", 0)),
         str(student_data.get("inaccuracies", 0))],
        ["Final",
         f"{student_data.get('endgame_accuracy', 0):.1f}%" if student_data.get("endgame_accuracy") else "—",
         "—", "—", "—"],
    ]
    at = Table(acc, colWidths=[3.5*cm, 3*cm, 3*cm, 3*cm, 3*cm])
    at.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWHEIGHT", (0, 0), (-1, -1), 0.65*cm),
    ]))
    story += [at, Spacer(1, 0.4*cm)]

    # Impressão digital
    if student_data.get("favorite_opening") or student_data.get("recurring_pattern"):
        story.append(Paragraph("Impressão Digital do Jogador", st["section"]))
        fp_rows = []
        if student_data.get("favorite_opening"):
            fp_rows.append(["Abertura favorita", student_data["favorite_opening"]])
        if student_data.get("strongest_phase"):
            fp_rows.append(["Fase mais forte", student_data["strongest_phase"]])
        if student_data.get("most_lost_piece"):
            fp_rows.append(["Peça mais envolvida em erros", student_data["most_lost_piece"]])
        if student_data.get("recurring_pattern"):
            fp_rows.append(["Padrão recorrente", student_data["recurring_pattern"]])
        if fp_rows:
            ft = Table(fp_rows, colWidths=[6*cm, 9.5*cm])
            ft.setStyle(TableStyle([
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWHEIGHT", (0, 0), (-1, -1), 0.65*cm),
            ]))
            story += [ft, Spacer(1, 0.4*cm)]

    story += [
        HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
        Paragraph(
            f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')} | "
            "Plataforma de Xadrez Escolar | Dados protegidos conforme LGPD",
            st["note"],
        ),
    ]

    doc.build(story)
    return output_path
