# Generated by Django 5.1.3 on 2024-11-16 02:23

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='batch_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
    ]
