"""Add ApiToken

Revision ID: 937846561faf
Revises: d679c226343d
Create Date: 2023-11-16 19:42:31.560991

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "937846561faf"
down_revision = "d679c226343d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "apitoken",
        sa.Column("id", sa.Uuid, nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("token", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("apitoken", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_apitoken_id"), ["id"], unique=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("apitoken", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_apitoken_id"))

    op.drop_table("apitoken")
    # ### end Alembic commands ###
