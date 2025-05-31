from sqlalchemy import Column, Integer, String

from app.db.database import Base

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    huggin_face_refference = Column(String, nullable=False)
    size = Column(String, nullable=True)
