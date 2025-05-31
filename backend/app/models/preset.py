from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class Preset(Base):
    __tablename__ = "presets"

    id = Column(Integer, primary_key=True, index=True)
    public_name = Column(String, nullable=False)
    bot_name = Column(String, default="bot")
    task = Column(String(32000), default="", nullable=True)
    costraints = Column(String(32000), default="", nullable=True)
    model_id = Column(Integer, ForeignKey("models.id"))

    temperature = Column(Float, default=1.2)
    repetition_penalty = Column(Float, default=1.0)
    top_p = Column(Float, default=0.9)
    top_k = Column(Float, default=20.0)

    model = relationship("Model")
