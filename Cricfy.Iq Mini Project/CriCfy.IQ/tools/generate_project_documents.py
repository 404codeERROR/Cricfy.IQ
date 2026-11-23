from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPORT = PROJECT_ROOT / "PROJECT_REPORT.md"
DOCUMENTATION = PROJECT_ROOT / "PROJECT_DOCUMENTATION.md"


def clean_markdown(text):
    text = text.strip()
    if text.startswith("# "):
        text = text[2:]
    return text.replace("**", "").replace("`", "")


def add_docx_markdown(document, markdown_path):
    for raw in markdown_path.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if not line:
            document.add_paragraph()
        elif line.startswith("# ") and line != "# Cricfy.iq":
            document.add_heading(clean_markdown(line), level=1)
        elif line.startswith("## "):
            document.add_heading(clean_markdown(line), level=1)
        elif line.startswith("### "):
            document.add_heading(clean_markdown(line), level=2)
        elif line.startswith("- "):
            document.add_paragraph(clean_markdown(line[2:]), style="List Bullet")
        elif line.startswith("|") and "|" in line:
            continue
        elif line.startswith("```"):
            continue
        elif set(line) == {"-"}:
            continue
        else:
            paragraph = document.add_paragraph(clean_markdown(line))
            paragraph_format = paragraph.paragraph_format
            paragraph_format.space_after = Pt(6)


def generate_docx(markdown_path, output_path, title):
    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.7)
    section.bottom_margin = Inches(0.7)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    styles = document.styles
    styles["Normal"].font.name = "Calibri"
    styles["Normal"].font.size = Pt(10.5)
    styles["Title"].font.name = "Calibri"

    heading = document.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading_run = heading.add_run(title)
    heading_run.bold = True
    heading_run.font.size = Pt(20)

    add_docx_markdown(document, markdown_path)
    document.save(output_path)


def pdf_escape(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("**", "")
        .replace("`", "")
    )


def generate_pdf(markdown_path, output_path):
    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title=markdown_path.stem,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CricfyTitle", parent=styles["Title"], alignment=TA_CENTER, fontSize=19, leading=23, textColor=colors.HexColor("#10243f")))
    styles.add(ParagraphStyle(name="CricfyHeading", parent=styles["Heading1"], fontSize=15, leading=18, textColor=colors.HexColor("#1769bd"), spaceBefore=10, spaceAfter=6))
    styles.add(ParagraphStyle(name="CricfySubheading", parent=styles["Heading2"], fontSize=12, leading=15, textColor=colors.HexColor("#1d4f78"), spaceBefore=8, spaceAfter=5))
    styles.add(ParagraphStyle(name="CricfyBody", parent=styles["BodyText"], fontSize=9.5, leading=13, textColor=colors.HexColor("#243447"), spaceAfter=5))

    story = []
    lines = markdown_path.read_text(encoding="utf-8").splitlines()
    story.append(Paragraph(pdf_escape(lines[0].lstrip("# ").strip()), styles["CricfyTitle"]))
    story.append(Spacer(1, 10))
    in_table = False
    table_rows = []

    for raw in lines[1:]:
        line = raw.rstrip()
        if not line:
            continue
        if line.startswith("```"):
            continue
        if line.startswith("# "):
            story.append(Paragraph(pdf_escape(line[2:].strip()), styles["CricfyHeading"]))
        elif line.startswith("## "):
            story.append(Paragraph(pdf_escape(line[3:].strip()), styles["CricfyHeading"]))
        elif line.startswith("### "):
            story.append(Paragraph(pdf_escape(line[4:].strip()), styles["CricfySubheading"]))
        elif line.startswith("- "):
            story.append(Paragraph("• " + pdf_escape(line[2:].strip()), styles["CricfyBody"]))
        elif line.startswith("|") and "|" in line:
            values = [pdf_escape(value.strip()) for value in line.strip("|").split("|")]
            if set(line.replace("|", "").strip()) == {"-"}:
                continue
            table_rows.append(values)
            in_table = True
        else:
            if in_table and table_rows:
                table = Table(table_rows, repeatRows=1, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1769bd")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#9bb1c9")),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]))
                story.append(table)
                story.append(Spacer(1, 8))
                table_rows = []
                in_table = False
            story.append(Paragraph(pdf_escape(line), styles["CricfyBody"]))

    if in_table and table_rows:
        table = Table(table_rows, repeatRows=1, hAlign="LEFT")
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1769bd")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#9bb1c9")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        story.append(table)

    document.build(story)


if __name__ == "__main__":
    generate_docx(REPORT, PROJECT_ROOT / "CRICFY_IQ_PROJECT_REPORT.docx", "Cricfy.iq Project Report")
    generate_pdf(REPORT, PROJECT_ROOT / "CRICFY_IQ_PROJECT_REPORT.pdf")
    generate_docx(DOCUMENTATION, PROJECT_ROOT / "CRICFY_IQ_PROJECT_DOCUMENTATION.docx", "Cricfy.iq Project Documentation")
    generate_pdf(DOCUMENTATION, PROJECT_ROOT / "CRICFY_IQ_PROJECT_DOCUMENTATION.pdf")
    print("Generated Word and PDF versions of the report and documentation.")
