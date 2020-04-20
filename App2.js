Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        })
        
        this.add(this.pulldownContainer)
        this.loadIterations()
    },

    loadIterations: function() {
        this.iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox' , {
            fieldLabel: 'Sprint',
            labelAlign: 'right',
            listeners: {
                ready: function(comboBox) {
                    this.loadSevs()
                },
                select: function(comboBox, records) {
                    this.loadData()
                },
                scope: this
            }
        })

        this.pulldownContainer.add(this.iterationComboBox)
    },

    loadSevs: function() {
        this.sevComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            fieldLabel: 'Severity',
            labelAlign: 'right',
            model: 'Defect', 
            field: 'Severity',
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

        this.pulldownContainer.add(this.sevComboBox)
    },

    loadData: function() {
        var selectedInteration = this.iterationComboBox.getRecord().get('_ref')
        var selectedSev = this.sevComboBox.getRecord().get('value')
        var filters = [
            {
                property: 'Iteration',
                operation: '=',
                value: selectedInteration
            },
            {
                property: 'Severity',
                operation: '=',
                value: selectedSev
            }
        ]

        if (this.store) {
            this.store.setFilter(filters)
            this.store.load()
        } else {
            this.store = Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                autoLoad: true,
                filters: filters,
                listeners: {
                    load: function(store, data, success) {
                        this.createGrid(store)
                    },
                    scope: this
                },
                fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
            });
        }
    },

    createGrid: function(store) {
        if (!this.grid) {
            this.grid = Ext.create('Rally.ui.grid.Grid', {
                store: store,
                columnCfgs: [
                    'FormattedID', 'Name', 'Severity', 'Iteration'
                ]
            })

            this.add(this.grid)
        }
    }
});