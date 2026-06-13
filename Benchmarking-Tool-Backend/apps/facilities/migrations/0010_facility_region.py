from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('facilities', '0009_facilitydetail_v2_netzwerk2_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='facility',
            name='region',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
