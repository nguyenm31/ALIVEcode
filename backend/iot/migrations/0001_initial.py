# Generated by Django 3.2.4 on 2021-07-30 03:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import iot.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('playground', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IoTProject',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=20)),
                ('description', models.CharField(max_length=100)),
                ('body', models.CharField(default='{}', max_length=100000)),
                ('access', models.CharField(choices=[('PU', 'Public'), ('UN', 'Unlisted'), ('RE', 'Restricted'), ('PR', 'Private')], default='PR', max_length=2)),
                ('interact_rights', models.CharField(choices=[('AN', 'Anyone'), ('CO', 'Collaborators'), ('PR', 'Private')], default='PR', max_length=2)),
                ('collaborators', models.ManyToManyField(max_length=100, related_name='IoTProjects_collab', to=settings.AUTH_USER_MODEL)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='IoTProjects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('route', models.CharField(max_length=15, validators=[iot.models.route_validator])),
                ('protocol', models.CharField(choices=[('WS', 'Websocket'), ('HP', 'HTTP POST'), ('HG', 'HTTP GET')], default='HP', max_length=2)),
                ('linkedScript', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='linked_routes', to='playground.alivescript')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='iot.iotproject')),
            ],
        ),
        migrations.CreateModel(
            name='IoTSystem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=20)),
                ('label', models.CharField(choices=[('HO', 'Home'), ('OT', 'Other')], default='HO', max_length=2)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='IoTSystems', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='IoTCluster',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('projects', models.ManyToManyField(related_name='clusters', to='iot.IoTProject')),
                ('systems', models.ManyToManyField(max_length=5, related_name='clusters', to='iot.IoTSystem')),
            ],
        ),
    ]
