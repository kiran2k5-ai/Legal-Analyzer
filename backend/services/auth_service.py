from database.mongodb import users_collection
from utils.hashing import hash_password, verify_password
from models.user import User

async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email.lower()})

async def create_user(user_data: User):
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        return None
    
    # Hash password
    hashed = hash_password(user_data.password)
    
    # Insert new user record
    new_user = {
        "full_name": user_data.full_name,
        "email": user_data.email.lower(),
        "hashed_password": hashed
    }
    
    await users_collection.insert_one(new_user)
    return new_user

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return None
    
    if not verify_password(password, user["hashed_password"]):
        return None
        
    return user
