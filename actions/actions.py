from typing import Any, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import unicodedata
from google.cloud import firestore

db = firestore.Client.from_service_account_json(
    "D:/Taller-de-Proyectos/actions/firebase-key.json"      # ← tu ruta real
)



class ActionRecomendarContenido(Action):
    def name(self) -> str:
        return "action_recomendar_contenido"



    async def run(
        self, dispatcher: CollectingDispatcher,
        tracker: Tracker, domain: Dict[str, Any]
        
    ) -> List[Dict[str, Any]]:


        tema_raw = tracker.get_slot("tema") or ""

        tema = unicodedata.normalize("NFD", tema_raw) \
        .encode("ascii", "ignore").decode("utf-8") \
        .lower().strip()
        
        if not tema:
            dispatcher.utter_message(text="¿Sobre qué tema necesitas material?")
            return []

        # ① toma el estilo de forma segura
        estilo = tracker.latest_message.get("metadata", {}).get("style", "visual")

        # ② lee Firestore
        doc = db.collection("contenido").document(tema).get()
        if not doc.exists:
            dispatcher.utter_message(text=f"Lo siento, aún no tengo recursos de {tema}.")
            return []

        data = doc.to_dict()
        pdf, podcast, video = data.get("pdf"), data.get("podcast"), data.get("video")

        # ③ elige el enlace
        if estilo == "kinestesico" and pdf:
            msg = f"Aquí tienes un PDF práctico de **{tema}** 👉 {pdf}"
        elif estilo == "auditivo" and podcast:
            msg = f"Te recomiendo este podcast sobre **{tema}** 🎧 {podcast}"
        elif estilo == "visual" and video:
            msg = f"🖥️ Este video explica **{tema}** en detalle:\n{video}"
        else:
            msg = f"Tengo estos recursos para {tema}:\n▶️ {video or '–'}\n🎧 {podcast or '–'}\n📄 {pdf or '–'}"

        dispatcher.utter_message(text=msg, markdown=True)
        return []
