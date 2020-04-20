Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //this.loadData()
        this.loadIterations()
    },

    loadIterations: function() {
        this.iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox' , {
            listeners: {
                ready: function(comboBox) {
                    this.loadData()
                },
                select: function(comboBox, records) {
                    this.loadData()
                },
                scope: this
            }
        })

        this.add(this.iterationComboBox)
    },

    loadData: function() {
        var selectedInteration = this.iterationComboBox.getRecord().get('_ref')
    
        var store = Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            autoLoad: true,
            filters: [
                {
                    property: 'Iteration',
                    operation: '=',
                    value: selectedInteration
                }
            ],
            listeners: {
                load: function(store, data, success) {
                    this.loadGrid(store, data)
                },
                scope: this
            },
            fetch: ['FormattedID', 'Name', 'Severity', 'Iteration', 'PortfolioItem']
        });
    },

    loadGrid: function(store, data) {
        var records = _.map(data, function(record) {
            console.log(record)
            //Perform custom actions with the data here
            //Calculations, etc.
            return Ext.apply({
               //TaskCount: record.get('PortfolioItem') ? record.get('PortfolioItem').Name : ''
               TaskCount: record.raw.PortfolioItem ? record.raw.PortfolioItem.Name : ''
            }, record.getData());
        });
       
        var grid = Ext.create('Rally.ui.grid.Grid', {
            store: Ext.create('Rally.data.custom.Store', {
                data: records
            }),
            //columnCfgs: [
            //    'FormattedID', 'Name', 'Severity', 'Iteration', 'PortfolioItem'
            //]
            columnCfgs: [
                {
                    text: 'Name',
                    dataIndex: 'Name',
                },
                {
                    text: 'Epic',
                    dataIndex: 'TaskCount',
                },
                {
                    text: 'Epic 2',
                    dataIndex: 'PortfolioItem',
                    renderer: function(value) {
                        return value.Name;
                    }
                }
            ]
        })

        this.add(grid)
    }
});