from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.site_setting import SiteSetting


class PublicService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_site_settings(self) -> dict[str, str]:
        result = await self.db.execute(select(SiteSetting))
        settings = result.scalars().all()
        return {s.key: s.value for s in settings}

    async def get_journey(self) -> list[dict]:
        return [
            {
                "id": "1",
                "title": "The Beginning",
                "description": "Started the transformation journey with a commitment to change.",
                "date": None,
                "milestone_type": "milestone",
                "value": "320 lbs",
                "sort_order": 1,
            },
            {
                "id": "2",
                "title": "First Milestone",
                "description": "Dropped 50 pounds through consistent training and nutrition.",
                "date": None,
                "milestone_type": "milestone",
                "value": "270 lbs",
                "sort_order": 2,
            },
            {
                "id": "3",
                "title": "Halfway There",
                "description": "Hit the halfway mark with renewed motivation and discipline.",
                "date": None,
                "milestone_type": "milestone",
                "value": "220 lbs",
                "sort_order": 3,
            },
            {
                "id": "4",
                "title": "Goal Achieved",
                "description": "Reached the target weight and transformed into a new person.",
                "date": None,
                "milestone_type": "milestone",
                "value": "170 lbs",
                "sort_order": 4,
            },
        ]

    async def get_statistics(self) -> dict:
        return {
            "total_weight_lost": "150",
            "active_members": "1200",
            "workout_videos": "200",
            "success_rate": "95",
        }

    async def get_faq(self) -> list[dict]:
        return [
            {
                "question": "What equipment do I need?",
                "answer": "Most workouts can be done with basic equipment like dumbbells and resistance bands. We also offer bodyweight-only programs for beginners.",
            },
            {
                "question": "How do I get started?",
                "answer": "Simply create a free account and you'll have instant access to all workout videos, blog posts, and the community forum.",
            },
            {
                "question": "Is there a community aspect?",
                "answer": "Absolutely! You get access to our community where you can share progress, ask questions, and connect with fellow members.",
            },
            {
                "question": "How often is new content added?",
                "answer": "New workout videos and blog posts are added weekly. The coach regularly updates the program based on member feedback and results.",
            },
            {
                "question": "Can I access content on my phone?",
                "answer": "Yes, the platform is fully responsive and works on all devices including smartphones, tablets, and desktop computers.",
            },
        ]