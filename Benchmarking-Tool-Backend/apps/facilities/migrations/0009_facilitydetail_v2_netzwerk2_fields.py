# Netzwerk-2 / V2 data-model extension: 8 field renames + 17 new nullable columns.
# Renames preserve existing data; new columns default NULL (NULL != 0). Reversible.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('facilities', '0008_alter_facilitydetail_cleaning_costs_and_more'),
    ]

    operations = [
        # --- FR-01: field renames (data preserved) ---
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='catering_costs',
            new_name='material_goods_costs',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='cleaning_costs',
            new_name='outsourced_services_costs',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='maintenance_costs',
            new_name='other_operating_costs',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='income_from_conferences',
            new_name='other_income',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='income_from_donations',
            new_name='donations_subsidies_income',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='income_from_catering',
            new_name='catering_income',
        ),
        migrations.RenameField(
            model_name='facilitydetail',
            old_name='income_from_accomodation',
            new_name='accommodation_income',
        ),

        # --- verbose_name updates for renamed fields (no SQL; keeps state in sync) ---
        migrations.AlterField(
            model_name='facilitydetail',
            name='material_goods_costs',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='Material / Goods incl. Hygiene'),
        ),
        migrations.AlterField(
            model_name='facilitydetail',
            name='outsourced_services_costs',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=12, verbose_name='Outsourced Services Costs'),
        ),
        migrations.AlterField(
            model_name='facilitydetail',
            name='other_operating_costs',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='Other Operating Costs'),
        ),
        migrations.AlterField(
            model_name='facilitydetail',
            name='other_income',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Other Income'),
        ),

        # --- FR-02: 3 new cost fields (nullable) ---
        migrations.AddField(
            model_name='facilitydetail',
            name='repair_maintenance_costs',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Repair & Maintenance Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='depreciation_costs',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Depreciation Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='rent_lease_costs',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Rent / Lease Costs'),
        ),

        # --- FR-07: 4 group / event fields (nullable) ---
        migrations.AddField(
            model_name='facilitydetail',
            name='total_groups',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Total Groups / Seminars'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='own_groups',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Own Groups / Seminars'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='own_participants',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Own Participants'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='returning_groups',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Returning Groups'),
        ),

        # --- FR-08: per-area personnel block, 5 areas x {hours, wage} (nullable) ---
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_admin_hours',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Administration Annual Hours'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_admin_wage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Administration Wage Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_kitchen_hours',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Housekeeping-Kitchen Annual Hours'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_kitchen_wage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Housekeeping-Kitchen Wage Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_cleaning_hours',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Housekeeping-Cleaning Annual Hours'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_cleaning_wage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Housekeeping-Cleaning Wage Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_tech_hours',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Technical Annual Hours'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_tech_wage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Technical Wage Costs'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_edu_hours',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Pedagogy Annual Hours'),
        ),
        migrations.AddField(
            model_name='facilitydetail',
            name='pers_edu_wage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, verbose_name='Pedagogy Wage Costs'),
        ),
    ]
