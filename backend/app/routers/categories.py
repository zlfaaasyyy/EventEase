from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.Category import Category
from app.schemas.Category import CategoryCreate
from app.schemas.Category import CategoryUpdate
from app.schemas.Category import CategoryResponse
from app.auth.dependencies import require_admin

router = APIRouter()


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db)
):

    categories = db.query(Category).all()

    return categories


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


@router.post("/categories", response_model=CategoryResponse)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    existing = db.query(Category).filter(
        Category.category_name == payload.category_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    new_category = Category(
        category_name=payload.category_name,
        description=payload.description
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    if payload.category_name is not None:
        category.category_name = payload.category_name

    if payload.description is not None:
        category.description = payload.description

    db.commit()
    db.refresh(category)

    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Category deleted"
    }
