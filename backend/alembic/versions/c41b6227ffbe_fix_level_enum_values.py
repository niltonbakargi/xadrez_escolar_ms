"""fix_level_enum_values

Revision ID: c41b6227ffbe
Revises: 72d53f3edad8
Create Date: 2026-04-26 15:42:51.506834

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c41b6227ffbe'
down_revision: Union[str, None] = '72d53f3edad8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Corrige os valores do ENUM level de minúsculas para os valores reais do modelo
    op.execute(
        "ALTER TABLE users MODIFY COLUMN level "
        "ENUM('Peão','Cavalo','Bispo','Torre','Dama','Rei') "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    # Corrige o ENUM role para garantir consistência
    op.execute(
        "ALTER TABLE users MODIFY COLUMN role "
        "ENUM('student','teacher','admin') "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE users MODIFY COLUMN level "
        "ENUM('peao','cavalo','bispo','torre','dama','rei')"
    )
