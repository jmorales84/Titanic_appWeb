from rest_framework import serializers

class PassengerSerializer(serializers.Serializer):
    Pclass = serializers.IntegerField()
    Sex = serializers.CharField(max_length=10)
    Age = serializers.FloatField()
    SibSp = serializers.IntegerField()
    Parch = serializers.IntegerField()
    Fare = serializers.FloatField()
    Embarked = serializers.CharField(max_length=10)