/*
 * Copyright (C) 2014 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By: silas@reciprocitylabs.com
 * Maintained By: silas@reciprocitylabs.com
 */


(function ($, CMS, GGRC) {
  var RiskAssessmentV2Extension = {};

  // Insert risk mappings to all gov/business object types
  var _risk_object_types = [
      "Program",
      "Regulation", "Standard", "Policy", "Contract",
      "Objective", "Control", "Section", "Clause",
      "System", "Process",
      "DataAsset", "Facility", "Market", "Product", "Project",
      "MultitypeSearch"
    ],
    related_object_descriptors = {},
    threat_actor_descriptor, risk_descriptor;

  // Register `risk_assessment_v2` extension with GGRC
  GGRC.extensions.push(RiskAssessmentV2Extension);

  RiskAssessmentV2Extension.name = "risk_assessment_v2";

  // Register Risk Assessment models for use with `infer_object_type`
  RiskAssessmentV2Extension.object_type_decision_tree = function () {
    return {
      "risk": CMS.Models.Risk,
      "threat_actor": CMS.Models.ThreatActor
    };
  };

  // Configure mapping extensions for ggrc_risk_assessment_v2
  RiskAssessmentV2Extension.init_mappings = function init_mappings() {
    var Proxy = GGRC.MapperHelpers.Proxy,
      Direct = GGRC.MapperHelpers.Direct,
      Cross = GGRC.MapperHelpers.Cross,
      CustomFilter = GGRC.MapperHelpers.CustomFilter,
      Reify = GGRC.MapperHelpers.Reify,
      Search = GGRC.MapperHelpers.Search,
      TypeFilter = GGRC.MapperHelpers.TypeFilter,
      Multi = GGRC.MapperHelpers.Multi,
      Indirect = GGRC.MapperHelpers.Indirect;

    // Add mappings for risk objects
    var mappings = {

      related: {
        related_objects_as_source: Proxy(
          null, "destination", "Relationship", "source", "related_destinations"),
        related_objects_as_destination: Proxy(
          null, "source", "Relationship", "destination", "related_sources"),
        related_objects: Multi(["related_objects_as_source", "related_objects_as_destination"]),
      },
      related_objects: {
        _canonical: {
          "related_objects_as_source": _risk_object_types,
          related_objectives: "Objective"
        },
        related_programs: TypeFilter("related_objects", "Program"),
        related_data_assets: TypeFilter("related_objects", "DataAsset"),
        related_facilities: TypeFilter("related_objects", "Facility"),
        related_markets: TypeFilter("related_objects", "Market"),
        related_processes: TypeFilter("related_objects", "Process"),
        related_products: TypeFilter("related_objects", "Product"),
        related_projects: TypeFilter("related_objects", "Project"),
        related_systems: TypeFilter("related_objects", "System"),
        related_controls: TypeFilter("related_objects", "Control"),
        related_clauses: TypeFilter("related_objects", "Clause"),
        related_objectives: TypeFilter("related_objects", "Objecitve"),
        related_sections: TypeFilter("related_objects", "Section"),
        related_regulations: TypeFilter("related_objects", "Regulation"),
        related_contracts: TypeFilter("related_objects", "Contract"),
        related_policies: TypeFilter("related_objects", "Policy"),
        related_standards: TypeFilter("related_objects", "Standard"),
        related_objectives: Proxy(
          "Objective", "objective", "ObjectObjective", "objectiveable", "object_objectives")
      },
      related_risk: {
        _canonical: {
          "related_objects_as_source": ['Risk'].concat(_risk_object_types)
        },
        related_risks: TypeFilter("related_objects", "Risk"),
      },
      related_threat_actor: {
        _canonical: {
          "related_objects_as_source": ['ThreatActor'].concat(_risk_object_types)
        },
        related_threat_actors: TypeFilter("related_objects", "ThreatActor"),
      },
      Risk: {
        _mixins: ['related', 'related_objects', 'related_threat_actor'],
        orphaned_objects: Multi([]),
      },
      ThreatActor: {
        _mixins: ['related', 'related_objects', 'related_risk'],
        orphaned_objects: Multi([])
      },
      Person: {
        owned_risks: Indirect("Risk", "contact"),
        owned_threat_actors: Indirect("ThreatActor", "contact"),
      },
    };

    can.each(_risk_object_types, function (type) {
      if (["Control", "Section", "Objective"].indexOf(type) > -1) {
        var related_and_able_objects = GGRC.Mappings.modules.ggrc_core[type].related_and_able_objects.sources;
        mappings[type] = {
          _canonical: {
            "related_objects": ['Risk', 'RiskObject', 'ThreatActor']
          },
          related_risks:            TypeFilter("related_objects", "Risk"),
          related_threat_actors:    TypeFilter("related_objects", "ThreatActor"),
          risks:                    TypeFilter("related_objects", "Risk"),
          risk_objects:             TypeFilter("related_objects", "RiskObject"),
          related_and_able_objects: Multi(related_and_able_objects.concat(["risks"])),
        };
      } else {
        mappings[type] = {
          _canonical: {
            "related_objects_as_source": ['Risk', 'ThreatActor']
          },
          _mixins: ['related', 'related_risk', 'related_threat_actor'],
        };
      }
    });
    new GGRC.Mappings("ggrc_risk_assessment_v2", mappings);
  };

  // Override GGRC.extra_widget_descriptors and GGRC.extra_default_widgets
  // Initialize widgets for risk page
  RiskAssessmentV2Extension.init_widgets = function init_widgets() {
    var page_instance = GGRC.page_instance(),
        is_my_work = function is_my_work() {
          return page_instance.type === "Person";
        },
        related_or_owned = is_my_work() ? 'owned_' : 'related_';

    // Init widget descriptors:
    can.each(_risk_object_types, function (model_name) {

      if (model_name === 'MultitypeSearch') {
        return;
      }

      var model = CMS.Models[model_name];
      related_object_descriptors[model_name] = {
        content_controller: CMS.Controllers.TreeView,
        content_controller_selector: "ul",
        widget_initial_content: '<ul class="tree-structure new-tree"></ul>',
        widget_id: model.table_plural,
        widget_name: model.model_plural,
        widget_icon: model.table_singular,
        content_controller_options: {
          child_options: [],
          draw_children: false,
          parent_instance: page_instance,
          model: model,
          mapping: "related_" + model.table_plural,
        }
      }
    });
    threat_actor_descriptor = {
      content_controller: CMS.Controllers.TreeView,
      content_controller_selector: "ul",
      widget_initial_content: '<ul class="tree-structure new-tree"></ul>',
      widget_id: CMS.Models.ThreatActor.table_plural,
      widget_name: CMS.Models.ThreatActor.title_plural,
      widget_icon: CMS.Models.ThreatActor.table_singular,
      content_controller_options: {
        child_options: [],
        draw_children: false,
        parent_instance: page_instance,
        model: CMS.Models.ThreatActor,
        mapping: related_or_owned + CMS.Models.ThreatActor.table_plural,
        footer_view: is_my_work() ? null : GGRC.mustache_path + "/base_objects/tree_footer.mustache"
      }
    };
    risk_descriptor = {
      content_controller: CMS.Controllers.TreeView,
      content_controller_selector: "ul",
      widget_initial_content: '<ul class="tree-structure new-tree"></ul>',
      widget_id: CMS.Models.Risk.table_plural,
      widget_name: CMS.Models.Risk.title_plural,
      widget_icon: CMS.Models.Risk.table_singular,
      content_controller_options: {
        child_options: [],
        draw_children: false,
        parent_instance: page_instance,
        model: CMS.Models.Risk,
        mapping: related_or_owned + CMS.Models.Risk.table_plural,
        footer_view: is_my_work() ? null : GGRC.mustache_path + "/base_objects/tree_footer.mustache"
      }
    };

    if (page_instance instanceof CMS.Models.Risk) {
      RiskAssessmentV2Extension.init_widgets_for_risk_page();
    } else if (page_instance instanceof CMS.Models.ThreatActor) {
      RiskAssessmentV2Extension.init_widgets_for_threat_actor_page();
    } else if (page_instance instanceof CMS.Models.Person) {
      RiskAssessmentV2Extension.init_widgets_for_person_page();
    } else {
      RiskAssessmentV2Extension.init_widgets_for_other_pages();
    }
  };

  RiskAssessmentV2Extension.init_widgets_for_risk_page =
    function init_widgets_for_risk_page() {
      var risk_descriptors = $.extend({},
        related_object_descriptors, {
          ThreatActor: threat_actor_descriptor
        }
      );
      new GGRC.WidgetList("ggrc_risk_assessment_v2", {
        Risk: risk_descriptors
      });
  };

  RiskAssessmentV2Extension.init_widgets_for_threat_actor_page =
    function init_widgets_for_threat_actor_page() {
      var threat_actor_descriptors = $.extend({},
        related_object_descriptors, {
          Risk: risk_descriptor
        }
      );
      new GGRC.WidgetList("ggrc_risk_assessment_v2", {
        ThreatActor: threat_actor_descriptors
      });
  };

  RiskAssessmentV2Extension.init_widgets_for_person_page =
    function init_widgets_for_person_page() {
      var people_widgets = $.extend({}, {
          ThreatActor: threat_actor_descriptor
        }, {
          Risk: risk_descriptor
        }
      );

      new GGRC.WidgetList("ggrc_risk_assessment_v2", {
        Person: people_widgets,
      });
  };

  RiskAssessmentV2Extension.init_widgets_for_other_pages =
    function init_widgets_for_other_pages() {
      var descriptor = {},
          page_instance = GGRC.page_instance();
      if (page_instance && ~can.inArray(page_instance.constructor.shortName, _risk_object_types)) {
        descriptor[page_instance.constructor.shortName] = {
          risk: risk_descriptor,
          threat_actor: threat_actor_descriptor,
        };
      }
      new GGRC.WidgetList("ggrc_risk_assessment_v2", descriptor);
  };



  GGRC.register_hook("LHN.Sections", GGRC.mustache_path + "/dashboard/lhn_risk_assessment_v2");

  RiskAssessmentV2Extension.init_mappings();

})(this.can.$, this.CMS, this.GGRC);
