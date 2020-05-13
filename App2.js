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
                fetch: ['FormattedID', 'Name', 'Parent', 'State', 'c_CurrentQtrRank', 'c_ProductLineRank', 'Project', 'Children', 'PercentDoneByStoryCount', 'PercentDoneByStoryPlanEstimate'],
                context:  this.getContext().getDataContext()
            });
        }
    },

    createGrid: function(store, data) {
        console.log(data)
        var records = _.map(data, function(record) {
            var rank = 999
            var pname = ''
            var prank = 999
            
            if (record.get('Parent') != null && record.get('Parent').c_CurrentQtrRank != null) {
                rank = record.get('Parent').c_CurrentQtrRank
            }

            if (record.get('Project') != null && record.get('Project').Name != null) {
                pname = record.get('Project').Name
            }

            if (record.get('Parent') != null && record.get('Parent').c_ProductLineRank != null) {
                prank = record.get('Parent').c_ProductLineRank
            }

            return Ext.apply({
               Rank: rank,
               Prank: prank,
               Team: pname,
            }, record.getData());
        });
        
        if (this.grid) {
            this.remove(this.grid)
        }
            
        this.grid = Ext.create('Rally.ui.grid.Grid', {
        showRowActionsColumn: false,
        store: Ext.create('Rally.data.custom.Store', {
            data: records,
            sorters: [
                {
                    property: 'Rank',
                    direction: 'ASC'
                }
            ],
        }),
        columnCfgs: [
            {
                xtype: 'templatecolumn',
                text: 'ID',
                width: 100,
                tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
            },
            {
                text: 'Name',
                dataIndex: 'Name',
                flex: 1
            },
            {
                text: 'Parent Curr Qtr Rank',
                dataIndex: 'Rank',
            },
            {
                text: 'Product line Rank',
                dataIndex: 'Prank',
            },
            {
                xtype: 'templatecolumn',
                text: 'MBI',
                width: 100,
                tpl: Ext.create('Rally.ui.renderer.template.ParentTemplate'),
                flex: 1
            },
            {
                text: 'Project',
                dataIndex: 'Team',
            },
            {
                xtype: 'templatecolumn',
                text: 'Story progress',
                tpl: Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryCountTemplate'),
            },
            {
                xtype: 'templatecolumn',
                text: 'Points progress',
                tpl: Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryPlanEstimateTemplate'),
            }
        ]
    })

    this.add(this.grid)
    }
});