# Generated by Django 5.1.3 on 2024-11-16 02:59

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_order_batch_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='batch_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
    ]