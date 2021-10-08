export default class Utils{
  constructor(){
    this.setDocumentTitle()
  }

  setDocumentTitle(to) {
    if(to!== undefined && to.meta !== null){
      document.title = 'MHFLEX Enterprise_' + to.meta.title;
    }
  }
}
