Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [ {
        xtype: 'container',
        itemId: 'pulldown-container',
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    }],

    launch: function() {
        // contexts
        // helix:   /project/181133230516
        // bagel:   /project/309523688096
        // iDroids: /project/192531279468
        // mobile:  /project/189777012848

        console.log(this.getContext().getDataContext())
        this.loadReleases()
    },

    loadReleases: function() {
        var releaseComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox' , {
            itemId: 'releasePicker', 
            fieldLabel: 'Release',
            labelAlign: 'right',
            listeners: {
                ready: this.loadData,
                select: this.loadData,
                scope: this
            }
        })

        this.down('#pulldown-container').add(releaseComboBox)
    },

    getFilters: function(release) {
        var releaseFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Release',
            operation: '=',
            value: release
        })

        return filters = releaseFilter
    },

    loadData: function() {
        var selectedRelease = this.down('#releasePicker').getRecord().get('_ref')
        console.log(selectedRelease)

        var filters = this.getFilters(selectedRelease)
        
        if (this.store) {
            this.store.setFilter(filters)
            this.store.load()
        } else {
            this.store = Ext.create('Rally.data.wsapi.Store', {
                model: 'PortfolioItem/EPIC',
                autoLoad: true,
                filters: filters,
                listeners: {
                    load: function(store, data, success) {
                        this.createGrid(store, data)
                    },
                    scope: this
                },
                fetch: ['FormattedID', 'Name', 'Parent', 'State', 'c_CurrentQtrRank', 'Project'],
                context:  this.getContext().getDataContext()
            });
        }
    },

    createGrid: function(store, data) {
        var records = _.map(data, function(record) {
            var rank = 999
            var mbi = ''
            var pname = ''
            
            if (record.get('Parent') != null && record.get('Parent').c_CurrentQtrRank != null) {
                rank = record.get('Parent').c_CurrentQtrRank
            }

            if (record.get('Parent') != null && record.get('Parent').Name != null) {
                mbi = record.get('Parent').Name
            }

            if (record.get('Project') != null && record.get('Project').Name != null) {
                pname = record.get('Project').Name
            }

            return Ext.apply({
               Rank: rank,
               MBI: mbi,
               Team: pname
            }, record.getData());
        });
        
        if (this.grid) {
            this.remove(this.grid)
        }
            
        this.grid = Ext.create('Rally.ui.grid.Grid', {
        showRowActionsColumn: false,
        store: Ext.create('Rally.data.custom.Store', {
            data: records
        }),
        columnCfgs: [
            {
                xtype: 'templatecolumn',
                text: 'ID',
                dataIndex: 'FormattedID',
                width: 100,
                tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
            },
            {
                text: 'Name',
                dataIndex: 'Name',
                flex: 1
            },
            {
                text: 'Rank',
                dataIndex: 'Rank',
            },
            {
                text: 'MBI',
                dataIndex: 'MBI',
                flex: 1
            },
            {
                text: 'Project',
                dataIndex: 'Team',
            },
        ]
    })

    this.add(this.grid)
    }
});