# Generated by Django 5.1.3 on 2024-11-16 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_order_batch_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='date_of_delivery',
            field=models.DateField(blank=True, null=True),
        ),
    ]