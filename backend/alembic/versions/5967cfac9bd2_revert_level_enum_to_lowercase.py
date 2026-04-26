"""revert_level_enum_to_lowercase

Revision ID: 5967cfac9bd2
Revises: c41b6227ffbe
Create Date: 2026-04-26 15:54:42.153902

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5967cfac9bd2'
down_revision: Union[str, None] = 'c41b6227ffbe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Reverte para valores minúsculos sem acento (alinhado ao modelo Python)
    op.execute(
        "ALTER TABLE users MODIFY COLUMN level "
        "ENUM('peao','cavalo','bispo','torre','dama','rei')"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE users MODIFY COLUMN level "
        "ENUM('Pe\u00e3o','Cavalo','Bispo','Torre','Dama','Rei') "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
