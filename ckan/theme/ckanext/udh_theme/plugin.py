import random
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckan.logic as logic

def get_bg_css():
    return random.randint(1,10)

def get_recent_datasets(num=6):
    sorted_datasets = []
    request = toolkit.request
    organization = request.params.get('organization')

    search_params = {
        'rows': num,
        'sort': 'metadata_modified desc',
        'include_private': True
    }

    context = {'user': toolkit.g.user}

    if organization:
        search_params['fq'] = f'organization:{organization}'
    result = toolkit.get_action('package_search')(context, search_params)
    return result.get('results')

def get_group_stats():
    request = toolkit.request
    organization = request.params.get('organization')
    
    context = {'user': toolkit.g.user}
    data_dict = {
        'include_private': True
    }

    if organization:
        data_dict['orgs'] = organization
    
    try:
        result = logic.get_action('group_stats')(context, data_dict)
        return result
    except logic.NotAuthorized:
        return []
    except Exception as e:
        toolkit.get_logger(__name__).error(f"Failed to get group stats: {e}")
        return []

def get_org_names():
    params = {
        u'all_fields': True,
        u'include_dataset_count': False,
    }
    return logic.get_action('organization_list')({}, params)

class UdhThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('assets', 'udhtheme')

    # ITemplateHelpers

    def get_helpers(self):
        return {
            'get_bg_css': get_bg_css,
            'get_org_names': get_org_names,
            'get_recent_datasets':get_recent_datasets,
            'get_group_stats':get_group_stats,
        }

