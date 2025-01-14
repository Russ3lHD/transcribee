"""add DocumentShareToken

Revision ID: d679c226343d
Revises: 6392770332cd
Create Date: 2023-07-27 02:16:45.536051

"""
import sqlalchemy as sa
import sqlmodel
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "d679c226343d"
down_revision = "6392770332cd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "documentsharetoken",
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid, nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("document_id", sa.Uuid, nullable=False),
        sa.Column("token", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("can_write", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["document.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("documentsharetoken", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_documentsharetoken_id"), ["id"], unique=False
        )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("documentsharetoken", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_documentsharetoken_id"))

    op.drop_table("documentsharetoken")
    # ### end Alembic commands ###
