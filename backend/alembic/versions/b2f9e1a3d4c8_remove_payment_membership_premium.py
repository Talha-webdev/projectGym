"""remove payment, membership, premium; add pending_registrations

Revision ID: b2f9e1a3d4c8
Revises: 7a142ba44f57
Create Date: 2026-08-21 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2f9e1a3d4c8'
down_revision: Union[str, None] = '7a142ba44f57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop payments table and its indexes
    op.drop_index('ix_payments_user_created', table_name='payments')
    op.drop_index(op.f('ix_payments_stripe_payment_intent_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_status'), table_name='payments')
    op.drop_index(op.f('ix_payments_created_at'), table_name='payments')
    op.drop_table('payments')

    # Drop memberships table and its index
    op.drop_index('ix_memberships_active_end', table_name='memberships')
    op.drop_table('memberships')

    # Drop is_premium column and index from videos
    op.drop_index('ix_videos_is_premium', table_name='videos')
    op.drop_column('videos', 'is_premium')

    # Drop is_premium column and index from blogs
    op.drop_index('ix_blogs_is_premium', table_name='blogs')
    op.drop_column('blogs', 'is_premium')

    # Create pending_registrations table (was added to models after initial migration)
    op.create_table('pending_registrations',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=100), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('token', sa.String(length=255), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pending_registrations_email'), 'pending_registrations', ['email'], unique=True)
    op.create_index(op.f('ix_pending_registrations_token'), 'pending_registrations', ['token'], unique=True)


def downgrade() -> None:
    # Drop pending_registrations table
    op.drop_index(op.f('ix_pending_registrations_token'), table_name='pending_registrations')
    op.drop_index(op.f('ix_pending_registrations_email'), table_name='pending_registrations')
    op.drop_table('pending_registrations')

    # Recreate is_premium column on blogs
    op.add_column('blogs', sa.Column('is_premium', sa.Boolean(), nullable=False))
    op.create_index('ix_blogs_is_premium', 'blogs', ['is_premium'], unique=False)

    # Recreate is_premium column on videos
    op.add_column('videos', sa.Column('is_premium', sa.Boolean(), nullable=False))
    op.create_index('ix_videos_is_premium', 'videos', ['is_premium'], unique=False)

    # Recreate memberships table
    op.create_table('memberships',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('stripe_subscription_id'),
    sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_memberships_active_end', 'memberships', ['is_active', 'end_date'], unique=False)

    # Recreate payments table
    op.create_table('payments',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('stripe_session_id', sa.String(length=255), nullable=False),
    sa.Column('stripe_payment_intent_id', sa.String(length=255), nullable=True),
    sa.Column('stripe_charge_id', sa.String(length=255), nullable=True),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('stripe_session_id')
    )
    op.create_index(op.f('ix_payments_created_at'), 'payments', ['created_at'], unique=False)
    op.create_index(op.f('ix_payments_status'), 'payments', ['status'], unique=False)
    op.create_index(op.f('ix_payments_stripe_payment_intent_id'), 'payments', ['stripe_payment_intent_id'], unique=False)
    op.create_index('ix_payments_user_created', 'payments', ['user_id', 'created_at'], unique=False)
