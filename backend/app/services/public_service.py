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

    async def get_testimonials(self) -> list[dict]:
        return [
            {
                "id": "1",
                "name": "Sarah Johnson",
                "role": "Member since 2024",
                "content": "This program changed my life. I lost 30 pounds and gained confidence I never knew I had. The coach's dedication is incredible.",
                "avatar_url": None,
                "sort_order": 1,
            },
            {
                "id": "2",
                "name": "Mike Chen",
                "role": "Member since 2023",
                "content": "The structured approach to fitness and nutrition made all the difference. Six months in and I'm stronger than ever.",
                "avatar_url": None,
                "sort_order": 2,
            },
            {
                "id": "3",
                "name": "Emma Williams",
                "role": "Member since 2024",
                "content": "I've tried many programs, but this one actually works. The community support and expert guidance are unmatched.",
                "avatar_url": None,
                "sort_order": 3,
            },
        ]

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
                "question": "How does the 3-month membership work?",
                "answer": "The membership gives you full access to all premium content including workout videos, nutrition guides, and meal plans for 90 days. You can cancel anytime before renewal.",
            },
            {
                "question": "What equipment do I need?",
                "answer": "Most workouts can be done with basic equipment like dumbbells and resistance bands. We also offer bodyweight-only programs for beginners.",
            },
            {
                "question": "Can I get a refund?",
                "answer": "Yes, we offer a 14-day money-back guarantee if you're not satisfied with the program. No questions asked.",
            },
            {
                "question": "Is there a community aspect?",
                "answer": "Absolutely! Members get access to our private community where you can share progress, ask questions, and connect with fellow members.",
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