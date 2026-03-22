"""
Posts and comments routes
"""
from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from datetime import datetime
import uuid

from ..models.post import Post, Comment, CreatePostRequest, CreateCommentRequest
from ..data.seed_data import get_sample_posts, get_sample_comments
from ..utils.mock_auth import validate_mock_token, get_user_by_id

router = APIRouter(prefix="/posts", tags=["posts"])

_posts_db = []
_comments_db = []

def _initialize_data():
    global _posts_db, _comments_db
    if not _posts_db:
        _posts_db = get_sample_posts()
    if not _comments_db:
        _comments_db = get_sample_comments()

@router.get("", response_model=List[Post])
async def get_posts():
    _initialize_data()
    posts = []
    for post_data in reversed(_posts_db):
        post = Post(**post_data)
        post.comments = [Comment(**c) for c in _comments_db if c["post_id"] == post.id]
        post.comments_count = len(post.comments)
        posts.append(post)
    return posts

@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    _initialize_data()
    for post_data in _posts_db:
        if post_data["id"] == post_id:
            post = Post(**post_data)
            post.comments = [Comment(**c) for c in _comments_db if c["post_id"] == post.id]
            post.comments_count = len(post.comments)
            return post
    raise HTTPException(status_code=404, detail="Post not found")

@router.post("", response_model=Post)
async def create_post(request: CreatePostRequest, authorization: Optional[str] = Header(None)):
    _initialize_data()
    
    # Debug log
    print(f"Authorization header received: {authorization}")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token = authorization.replace("Bearer ", "").strip()
    print(f"Token extracted: {token}")
    
    user_id = validate_mock_token(token)
    print(f"User ID from token: {user_id}")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    post_id = f"post_{uuid.uuid4().hex[:8]}"
    post_data = {
        "id": post_id, "user_id": user.id, "username": user.username,
        "avatar_url": user.avatar_url, "caption": request.caption,
        "image_url": request.image_url, "created_at": datetime.now().isoformat(),
        "likes": 0, "comments_count": 0, "shares": 0, "saves": 0
    }
    _posts_db.append(post_data)
    post = Post(**post_data)
    post.comments = []
    return post

@router.post("/{post_id}/comments", response_model=Comment)
async def create_comment(post_id: str, request: CreateCommentRequest, authorization: Optional[str] = Header(None)):
    _initialize_data()
    if not any(p["id"] == post_id for p in _posts_db):
        raise HTTPException(status_code=404, detail="Post not found")
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    token = authorization.replace("Bearer ", "")
    user_id = validate_mock_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    comment_id = f"comment_{uuid.uuid4().hex[:8]}"
    comment_data = {
        "id": comment_id, "post_id": post_id, "user_id": user.id,
        "username": user.username, "avatar_url": user.avatar_url,
        "content": request.content, "created_at": datetime.now().isoformat(), "likes": 0
    }
    _comments_db.append(comment_data)
    for post in _posts_db:
        if post["id"] == post_id:
            post["comments_count"] = post.get("comments_count", 0) + 1
            break
    return Comment(**comment_data)

@router.post("/{post_id}/like")
async def like_post(post_id: str):
    _initialize_data()
    for post in _posts_db:
        if post["id"] == post_id:
            post["likes"] = post.get("likes", 0) + 1
            return {"success": True, "likes": post["likes"]}
    raise HTTPException(status_code=404, detail="Post not found")
