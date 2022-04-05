import ace from 'ace-builds/src-noconflict/ace'
import cacheLintInfo from './cache_lintinfo.json';
import api from '../../../Models/api';

// Generated by https://quicktype.io

export interface LinterFormatType {
	blocs: string[];
	datatype: Datatype;
	logiques: string[];
	operators: string[];
	fonctions: string[];
	variable: string;
	datatypes_names: string[];
	fin: string;
	fonctions_builtin: string[];
	control_flow: string[];
	const: string;
	modules: string[];
	commands: string[];
}

export interface Datatype {
	nul: string;
	entier: string;
	texte: string;
	decimal: string;
	booleen: string;
}

export interface Datatype {
	nul: string;
	entier: string;
	texte: string;
	decimal: string;
	booleen: string;
}

async function define() {
	return await api.as.getLintInfo();
}

let lintInfo: LinterFormatType = cacheLintInfo as LinterFormatType;
define().then(resolve => (lintInfo = resolve));

ace.define(
	'ace/mode/alivescript',
	[
		'require',
		'exports',
		'ace/lib/oop',
		'ace/mode/text',
		'ace/mode/simplifie_highlight_rules',
	],
	(acequire: any, exports: any) => {
		const oop = acequire('ace/lib/oop');
		const TextMode = acequire('ace/mode/text').Mode;
		const CustomHighlightRules = acequire(
			'ace/mode/simplifie_highlight_rules',
		).CustomHighlightRules;

		var Mode = function (this: any) {
			this.HighlightRules = CustomHighlightRules;
		};

		oop.inherits(Mode, TextMode); // ACE's way of doing inheritance

		exports.Mode = Mode; // eslint-disable-line no-param-reassign
	},
);

// This is where we really create the highlighting rules
ace.define(
	'ace/mode/simplifie_highlight_rules',
	['require', 'exports', 'ace/lib/oop', 'ace/mode/text_highlight_rules'],
	(acequire: any, exports: any) => {
		const oop = acequire('ace/lib/oop');
		const TextHighlightRules = acequire(
			'ace/mode/text_highlight_rules',
		).TextHighlightRules;

		const CustomHighlightRules = function CustomHighlightRules(this: any) {
			//this.$rules = new TextHighlightRules().getRules(); // Use Text's rules as a base
			// var identifierRe =
			// 	'[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*';
			const paramComment = '(\\{ *)(@)(.*? )(.*?)(\\})';
			let importedModules: string[] = [];
			//let usedVariables: string[] = []
			//let usedConstants: string[] = []

			this.$rules = {
				start: [
					{
						token: function (_arg: string) {
							importedModules = [];
							//usedVariables = [];
							//usedConstants = [];
						},
						regex: '',
						next: 'main',
					},
				],
				main: [
					{
						token: function (_utiliser: string, module: string) {
							if (lintInfo.modules.includes(module)) {
								importedModules.push(module);
								return ['variable.language', 'support.class'];
							} else return ['variable.language', 'invalid'];
						},
						regex: `(\\butiliser\\s+)(${lintInfo.variable})`,
					},
					{
						token: function (_declaration: string, variable_name: string) {
							//usedVariables.push(variable_name.trim())
							return ['variable.language', 'support'];
						},
						regex: `(\\bvar\\s+)(${lintInfo.variable}\\s+)`,
					},
					{
						token: function (_declaration: string, variable_name: string) {
							//usedVariables.push(variable_name.trim())
							return ['variable.language', 'support'];
						},
						regex: `(\\bvar\\s+)(${lintInfo.variable}\\s+)`,
					},
					{
						token: function (_declaration: string, variable_name: string) {
							//usedConstants.push(variable_name)
							return ['keyword.control.bold', 'support.italic'];
						},
						regex: `(${lintInfo.const}\\s+)(${lintInfo.variable})`,
					},
					{
						token: 'support',
						regex: lintInfo.operators.join('|'),
					},
					{
						token: 'variable.language',
						regex: lintInfo.commands.join('|'),
					},
					{
						token: 'keyword.control.bold',
						regex: `(${lintInfo.const})`,
					},
					{
						token: 'support.function',
						regex: lintInfo.fonctions.join('|'),
						next: 'fonction_arguments',
					},
					{
						token: 'keyword.control',
						regex: lintInfo.blocs
							.map(token => `${lintInfo.fin} ${token}`)
							.join('|'),
					},
					{
						token: 'keyword.control',
						regex: lintInfo.blocs.join('|'),
					},
					{
						token: 'keyword.operator',
						regex: lintInfo.logiques.join('|'),
					},
					{
						token: 'support.function',
						regex: lintInfo.fonctions
							.map(token => `${lintInfo.fin} ${token}`)
							.join('|'),
					},
					{
						token: 'variable.parameter',
						regex: lintInfo.datatypes_names.join('|'),
					},
					{
						token: 'keyword.control.bold',
						regex: lintInfo.control_flow.join('|'),
					},
					{
						token: 'support.class',
						regex: lintInfo.datatype.booleen,
					},
					{
						token: 'support.type.italic',
						regex: /(?!\.)/ + lintInfo.fonctions_builtin.join('|'),
					},
					{
						token: function (name: string, parenthesis: string) {
							if (lintInfo.fonctions_builtin.includes(name))
								return ['support.type.italic', 'empty'];
							else {
								//usedVariables.push(name)
								return ['support.type', 'empty'];
							}
						},
						regex: `(${lintInfo.variable})(\\((?=.*\\)))`,
					},
					{
						token: 'support.class',
						regex: lintInfo.datatype.nul,
					},
					{
						token: function (variable: string, dot?: string) {
							const lst = importedModules.includes(variable)
								? ['support.class']
								: ['support'];

							if (dot !== undefined) lst.push('empty');
							return lst;
							//else if (usedVariables.includes(variable))
							//	return ['support']
							//else if (usedConstants.includes(variable))
							//	return ['support.italic']
							//else
							//	return ['invisible']
						},
						regex: '(' + lintInfo.variable + ')(\\.?)', //"(?!\\s*\\()\\.?)",
					},
					{
						token: 'constant.numeric',
						regex: lintInfo.datatype.decimal,
					},
					{
						token: 'constant.numeric',
						regex: lintInfo.datatype.entier,
					},
					{
						token: 'string.double',
						regex: lintInfo.datatype.texte,
					},
					{
						token: 'comment.line',
						regex: '#.*',
					},
					{
						token: 'comment.line',
						regex: /\(:/,
						next: 'multi_line_comment',
					},
					{
						token: 'comment.line.italic',
						regex: /\(-:/,
						next: 'multi_line_documentation',
					},
					{
						token: 'keyword',
						regex: '\\s+',
					},
				],
				multi_line_comment: [
					{
						token: 'comment.line',
						regex: /.*:\)/,
						next: 'main',
					},
					{
						token: 'comment.line',
						regex: '.*',
					},
				],
				multi_line_documentation: [
					{
						token: 'comment.line.italic',
						regex: /.*:-\)/,
						next: 'main',
					},
					{
						token: (tiret: string, arobase: string, word: string) => {
							return [
								'comment.line.italic',
								'empty',
								'constant.numeric.italic',
							];
						},
						regex: /( *- *)(@)(.*? )/,
					},
					{
						token: (
							open: string,
							arobase: string,
							word: string,
							extra: string,
							close: string,
						) => {
							return [
								'empty',
								'empty',
								'constant.numeric.italic',
								'comment.line.italic',
								'empty',
							];
						},
						regex: paramComment,
					},
					{
						token: 'comment.line.italic',
						regex: `.*?(?=(${paramComment})|$)`,
					},
				],
				fonction_arguments: [
					{
						token: 'empty',
						regex: lintInfo.variable,
					},
					{
						token: 'punctuation.operator',
						regex: '(, )+',
					},
					{
						token: 'empty',
						regex: '(.*?)',
						next: 'main',
					},
				],
			};
		};

		oop.inherits(CustomHighlightRules, TextHighlightRules);
		exports.CustomHighlightRules = CustomHighlightRules;
	},
);

