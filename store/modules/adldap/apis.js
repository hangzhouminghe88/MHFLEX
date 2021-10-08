import rpc from 'src/utils/rpc';
export default {
  query(param){
    return rpc.query(`ldap/servers`, param);
  },
  querySystemTag(uuid){
    return rpc.query('system-tags', {
      q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO']
    })
  }
}
