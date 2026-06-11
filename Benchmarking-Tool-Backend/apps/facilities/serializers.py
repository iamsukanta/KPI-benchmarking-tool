from rest_framework import serializers

from .models import Category, Facility, FacilityDetail


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class UnapprovedUserFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ('id', 'name')


class FacilityDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityDetail
        fields = '__all__'
        extra_kwargs = {
            'facility': {
                'write_only': True
            }
        }


class FederationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    user_name = serializers.SerializerMethodField(allow_null=True)
    facility_count = serializers.IntegerField(read_only=True)
    
    @staticmethod
    def get_user_name(obj: Facility) -> str | None:
        if obj.user:
            return f'{obj.user.first_name} {obj.user.last_name}'
        return None

    class Meta:
        model = Facility
        fields = ('id', 'name', 'category', 'category_name', 'user', 'user_name', 'facility_count')


class FacilitySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    federation_name = serializers.CharField(source='federation.name', allow_null=True, read_only=True)
    user_name = serializers.SerializerMethodField(allow_null=True)
    user_facility_role = serializers.CharField(source='user.role', allow_null=True, read_only=True)

    @staticmethod
    def get_user_name(obj: Facility) -> str | None:
        if obj.user:
            return f'{obj.user.first_name} {obj.user.last_name}'
        return None
    
    def validate(self, attrs: dict[str, str | int | bool]) -> dict[str, str | int | bool]:
        is_federation = attrs.get('is_federation', False)
        rooms = attrs.get('rooms', None)
        beds = attrs.get('beds', None)

        if not is_federation:
            if not rooms and not beds:
                raise serializers.ValidationError({
                    'rooms': 'Dieses Feld ist erforderlich.',
                    'beds': 'Dieses Feld ist erforderlich.'
                })
            elif not rooms:
                raise serializers.ValidationError({
                    'rooms': 'Dieses Feld ist erforderlich.'
                })
            elif not beds:
                raise serializers.ValidationError({
                    'beds': 'Dieses Feld ist erforderlich.'
                })
        else:
            attrs.pop('rooms', None)
            attrs.pop('beds', None)
        return attrs
    
    def update(self, instance: Facility, validated_data: dict[str, str | int | bool]) -> Facility:
        validated_data.pop('is_federation', None)
        return super().update(instance, validated_data)

    class Meta:
        model = Facility
        fields = '__all__'


class FacilityRestrictedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        exclude = ('user', 'is_user_approved', 'is_active')
        read_only_fields = ('name', 'is_federation', 'federation',)


class FacilityWithDetailSerializer(FacilitySerializer):
    details = FacilityDetailSerializer(source='facility_details', many=True, read_only=True)


class FacilityDetailRetrieveSerializer(FacilityDetailSerializer):
    facility_id = serializers.IntegerField(source='facility.id')
    facility_name = serializers.CharField(source='facility.name')
    federation_id = serializers.IntegerField(source='facility.federation_id', allow_null=True)
    federation_name = serializers.CharField(source='facility.federation.name', allow_null=True)
    beds = serializers.IntegerField(source='facility.beds')
    rooms = serializers.IntegerField(source='facility.rooms')


class InternalBenchmarkQueryParamsSerializer(serializers.Serializer):
    federation = serializers.IntegerField()
    year = serializers.IntegerField()


class BenchmarkQueryParamsSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    facility = serializers.IntegerField()
