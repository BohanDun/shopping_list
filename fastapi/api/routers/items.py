from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, status, HTTPException
from api.models import Workout
from api.deps import db_dependency, user_dependency

router = APIRouter(prefix="/items", tags=["items"])

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

@router.get("/{item_id}")
def get_item(db: db_dependency, user: user_dependency, item_id: int):
    return (
        db.query(Workout)
        .filter(Workout.id == item_id, Workout.user_id == user.get("id"))
        .first()
    )

@router.get("/")
def get_items(db: db_dependency, user: user_dependency):
    return db.query(Workout).filter(Workout.user_id == user.get("id")).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_item(db: db_dependency, user: user_dependency, item: ItemCreate):
    db_item = Workout(**item.model_dump(), user_id=user.get("id"))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(db: db_dependency, user: user_dependency, item_id: int):
    db_item = (
        db.query(Workout)
        .filter(Workout.id == item_id, Workout.user_id == user.get("id"))
        .first()
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(db_item)
    db.commit()
