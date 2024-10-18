/* User script/gadget to add the {{Art photo}} template to freshly imported files with only the WD Qid in the description.
How it works: 
- on the file page, click on the "to ArtPhoto" link, 
- it will query the wikitext, change it, send it, and reload the page.*/

var comm_art_photo = {
	init : function () {
		var self = this ;
		var portletLink = mw.util.addPortletLink('p-navigation', '#', 'to ArtPhoto', 't-comm_art_photo');
		$(portletLink).click (function () {
			self.run() ;
			return false ;
		} ) ;
	},
	
	run : function () {
		var self = this ;
		var q = mw.config.get('wgTitle') ;
		
		var params = {
			action:'parse',
			page:"File:" + q,
			prop:'wikitext',
			format:'json',
		}, 
		api = new mw.Api();
		
		api.get ( params ).done(data => {
			var description = data.parse.wikitext["*"] ;
			if (description.includes("{{Art photo")) return ;
			
			/* 
			=={{int:filedesc}}==
			{{Information
			|description={{fr|1=Q1304}}
			|date=2020-01-04 14:13:44
			|source={{own}}
			|author=[[User:Sukkoria|Sukkoria]]
			|permission=
			|other versions=
			}} */
			
			const reg = /([.\n]*)(Information)([.\n|]*)(description={{[a-z]{2}\|1)(=Q[0-9]*)(}})([.\n|]*)(date)(=[\d\-\s:\w|={}]*)(author)(.*)/ ;
			
			var new_description = description.replace(reg, "$1Art photo$3wikidata$5$7photo date$9photographer$11") ;
			
			var params = {
				action: 'edit',
				title: "File:" + q,
				text: new_description,
				contentmodel: 'wikitext',
				summary: "description to ArtPhoto with custom script"
			};
			
			api.postWithToken( 'csrf', params).done( function ( data ) {
				mw.log ( "success" ) ;
				location.reload() ;
			}).fail( function( code, result ) {
				mw.log( "error " + code) ;
				mw.log(result) ;
			}); 
		}) ;
	},
};

jQuery(document).ready ( function() {
	if ( mw.config.get('wgNamespaceNumber') != 6 ) return ;
	if ( mw.config.get('wgAction') != 'view' ) return ;
	if ( mw.config.get('wbIsEditView') == false ) return ;
	if ( mw.config.get('wgIsRedirect') == true ) return ;
	
	comm_art_photo.init() ;
} ) ;
