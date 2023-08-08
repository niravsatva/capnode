"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfigurationSettings = exports.DefaultAdminPermissions = exports.DefaultPermissions = void 0;
exports.DefaultPermissions = [
    { permissionName: 'Dashboard', sortId: 1 },
    { permissionName: 'Employee Cost', sortId: 2 },
    { permissionName: 'Cost Allocations', sortId: 3 },
    { permissionName: 'Journals Entries', sortId: 4 },
    { permissionName: 'TimeLogs', sortId: 5 },
    { permissionName: 'TimeSheets', sortId: 6 },
    { permissionName: 'Roles', sortId: 7 },
    { permissionName: 'Users', sortId: 8 },
    { permissionName: 'Integrations', sortId: 9 },
    { permissionName: 'Configurations', sortId: 10 },
    { permissionName: 'Subscriptions', sortId: 11 },
    { permissionName: 'Custom Rules', sortId: 12 },
    { permissionName: 'Time Summary', sortId: 13 },
    { permissionName: 'Payroll Summary', sortId: 14 },
    { permissionName: 'Customer Overview', sortId: 15 },
];
exports.DefaultAdminPermissions = [
    {
        permissionName: 'Dashboard',
        sortId: 1,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Employee Cost',
        sortId: 2,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Cost Allocations',
        sortId: 3,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Journals Entries',
        sortId: 4,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'TimeLogs',
        sortId: 5,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'TimeSheets',
        sortId: 6,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Roles',
        sortId: 7,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Users',
        sortId: 8,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Integrations',
        sortId: 9,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Configurations',
        sortId: 10,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Subscriptions',
        sortId: 11,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Custom Rules',
        sortId: 12,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Time Summary',
        sortId: 13,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Payroll Summary',
        sortId: 14,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
    {
        permissionName: 'Customer Overview',
        sortId: 15,
        all: true,
        view: true,
        edit: true,
        delete: true,
        add: true,
    },
];
exports.DefaultConfigurationSettings = {
    '0': {
        id: '0',
        type: 'qbClass',
        fields: {
            f1: {
                id: 'f1',
                label: 'Salary Allocation Pool',
                value: null,
                ratesLimited: false,
                editable: false,
                deletable: false,
                isEditing: false,
            },
            f2: {
                id: 'f2',
                label: 'Indirect Allocation Pool',
                value: null,
                ratesLimited: false,
                editable: false,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: false,
        toolTip: 'Expense Pools:  These are the allocation accounts & it is mapped with QBO classes',
        placeHolder: 'Select QuickBooks class',
        errorMessage: 'Please Select QuickBooks class',
        qbMappingValue: 'Quickbooks Class',
        capMappingTitle: 'Expense Pools',
    },
    '1': {
        id: '1',
        type: 'qbCoa',
        fields: {
            f1: {
                id: 'f1',
                label: 'Salary',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
            f2: {
                id: 'f2',
                label: 'Vacation / PTO - Payroll Taxes',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: true,
        toolTip: 'Salary Expense Accounts:  These are the Salary expense accounts, if the user add a new account here, it will be added as new columns in Cost allocation ',
        placeHolder: 'Select QBO Chart of Account',
        errorMessage: 'Please Select QBO Chart of Account',
        qbMappingValue: 'QuickBooks Online Chart of Accounts',
        capMappingTitle: 'Salary Expense Accounts',
    },
    '2': {
        id: '2',
        type: 'qbCoa',
        fields: {
            f1: {
                id: 'f1',
                label: 'Health Insurance',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
            f2: {
                id: 'f2',
                label: 'Retirement',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
            f3: {
                id: 'f3',
                label: "Worker's Comp",
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: true,
        toolTip: 'Salary Expense Accounts:  These are the Salary expense accounts, if the user add a new account here, it will be added as new columns in Cost allocation',
        placeHolder: 'Select Fringe Expense',
        errorMessage: 'Please Select Fringe Expense',
        qbMappingValue: '',
        capMappingTitle: 'Fringe expense',
    },
    '3': {
        id: '3',
        type: 'qbCoa',
        fields: {
            f1: {
                id: 'f1',
                label: 'FICA - Payroll Taxes',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
            f2: {
                id: 'f2',
                label: 'SUI - Payroll Taxes',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: true,
        toolTip: 'Payroll Taxes Expense: These are the Payroll expense accounts, if the user add new account here, it will be added as new column in Cost allocation',
        placeHolder: 'Select Payroll Taxes Expense',
        errorMessage: 'Please Select Payroll Taxes Expense',
        qbMappingValue: '',
        capMappingTitle: 'Payroll Taxes Expense',
    },
    '4': {
        id: '4',
        type: 'qbCoa',
        fields: {
            f1: {
                id: 'f1',
                label: 'Indirect Allocations',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: false,
        toolTip: 'Indirect Expense Allocations:  These are the Fringe expense accounts, if the user add new account here, it will be added as new column in Cost allocation',
        placeHolder: 'Select Indirect Expense Allocations',
        errorMessage: 'Please Select Indirect Expense Allocations',
        qbMappingValue: '',
        capMappingTitle: 'Indirect Expense Allocations',
    },
    '5': {
        id: '5',
        type: 'qbCustomer',
        fields: {
            f1: {
                id: 'f1',
                label: 'General Operating',
                value: null,
                ratesLimited: false,
                editable: true,
                deletable: false,
                isEditing: false,
            },
        },
        addMore: false,
        toolTip: 'Funding Source: This is mapped with QBO Customer, This is also mapped with QBO Class.  (Used in a journal entry. This is the customer for the credit lines of the journal entry. See journal entry sample.)',
        placeHolder: 'Select Expense Pools Funding Source',
        errorMessage: 'Please Select Expense Pools Funding Source',
        qbMappingValue: 'Quickbooks Customer',
        capMappingTitle: 'Expense Pools Funding Source',
    },
};
