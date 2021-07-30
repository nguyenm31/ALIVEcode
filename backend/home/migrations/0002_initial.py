# Generated by Django 3.2.4 on 2021-07-30 03:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('home', '0001_initial'),
        ('playground', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='courses',
            field=models.ManyToManyField(blank=True, to='playground.Course'),
        ),
        migrations.AddField(
            model_name='student',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='professor',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='user',
            name='achievements',
            field=models.ManyToManyField(blank=True, to='home.Achievement'),
        ),
    ]
