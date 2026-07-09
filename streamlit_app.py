from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

APP_DIR = Path(__file__).parent

st.set_page_config(page_title="Penalty Shootout", page_icon="⚽", layout="centered")
st.title("⚽ Penalty Shootout")
st.caption("The same HTML/CSS/JS game, embedded and running live inside Streamlit.")

style = (APP_DIR / "style.css").read_text()
game_logic = (APP_DIR / "gameLogic.js").read_text()
script = (APP_DIR / "script.js").read_text()
body = (APP_DIR / "index.html").read_text().split("<body>", 1)[1].split("</body>", 1)[0]
body = body.split('<script src="gameLogic.js"></script>')[0]

embedded_html = f"""
<style>{style}</style>
{body}
<script>{game_logic}</script>
<script>{script}</script>
"""

components.html(embedded_html, height=520, scrolling=False)
