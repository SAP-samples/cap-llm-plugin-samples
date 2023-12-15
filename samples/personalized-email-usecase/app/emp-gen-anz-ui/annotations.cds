using EmployeeService as service from '../../srv/employee-service';

annotate service.Employee with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'id',
            Value : id,
        },
        {
            $Type : 'UI.DataField',
            Label : 'name',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'region',
            Value : region,
        },
        {
            $Type : 'UI.DataField',
            Label : 'tlevel',
            Value : tlevel,
        },
        {
            $Type : 'UI.DataField',
            Label : 'gender',
            Value : gender,
        },
            {
        $Type : 'UI.DataField',
        Label : 'age',
        Value : age,
    },
    {
        $Type : 'UI.DataField',
        Label : 'ssn',
        Value : ssn,
    },
    ]
);
annotate service.Employee with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'id',
                Value : id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'name',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'region',
                Value : region,
            },
            {
                $Type : 'UI.DataField',
                Label : 'tlevel',
                Value : tlevel,
            },
            {
                $Type : 'UI.DataField',
                Label : 'gender',
                Value : gender,
            },
            {
                $Type : 'UI.DataField',
                Label : 'age',
                Value : age,
            },
            {
                $Type : 'UI.DataField',
                Label : 'ssn',
                Value : ssn,
            },
            {
                $Type : 'UI.DataField',
                Label : 'personalizedEmail',
                Value : personalizedEmail,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
