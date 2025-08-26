from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi import APIRouter, status
from sqlalchemy.orm import joinedload

from api.models import Workout, Routine
from api.deps import db_dependency, user_dependency

router = APIRouter(
    prefix="/lists",
    tags=["lists"],
)

class ListBase(BaseModel):
    name: str
    description: Optional[str] = None

class ListCreate(ListBase):
    items: List[int] = Field(default_factory=list)
    workouts: List[int] = Field(default_factory=list)
    item_names: List[str] = Field(default_factory=list)

@router.get("/")
def get_lists(db: db_dependency, user: user_dependency):
    return (
        db.query(Routine)
        .options(joinedload(Routine.workouts))
        .filter(Routine.user_id == user.get("id"))
        .all()
    )

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_list(db: db_dependency, user: user_dependency, payload: ListCreate):
    db_list = Routine(
        name=payload.name,
        description=payload.description,
        user_id=user.get("id"),
    )

    ids = list(dict.fromkeys((payload.items or []) + (payload.workouts or [])))
    if ids:
        ws = db.query(Workout).filter(Workout.id.in_(ids)).all()
        db_list.workouts.extend(ws)

    if payload.item_names:
        names = [n.strip() for n in payload.item_names if n and n.strip()]
        if names:
            existing = (
                db.query(Workout)
                .filter(Workout.user_id == user.get("id"), Workout.name.in_(names))
                .all()
            )
            by_name = {w.name: w for w in existing}
            for nm in names:
                w = by_name.get(nm)
                if w is None:
                    w = Workout(name=nm, user_id=user.get("id"))
                    db.add(w)
                    db.flush()
                db_list.workouts.append(w)

    db.add(db_list)
    db.commit()
    db.refresh(db_list)

    return (
        db.query(Routine)
        .options(joinedload(Routine.workouts))
        .filter(Routine.id == db_list.id)
        .first()
    )

@router.delete("/{list_id}")
def delete_list(db: db_dependency, user: user_dependency, list_id: int):
    db_list = (
        db.query(Routine)
        .filter(Routine.id == list_id, Routine.user_id == user.get("id"))
        .first()
    )
    if db_list:
        db.delete(db_list)
        db.commit()
    return db_list
