import LineInterface from '../../ChallengeComponents/LineInterface/LineInterface';
import { useState, useRef, useEffect } from 'react';
import api from '../../../Models/api';
import { AsScriptProps } from './asScriptTypes';

export const AsScript = ({ asScript, onSave }: AsScriptProps) => {
	const [saving, setSaving] = useState(false);
	const content = useRef<string>(asScript.content);
	const saveTimeout = useRef<any>(null);

	useEffect(() => {
		return () => {
			saveTimeout.current && clearTimeout(saveTimeout.current);
		};
	}, []);

	const handleChange = async (newContent: string) => {
		setSaving(true);
		content.current = newContent;
		if (saveTimeout.current) clearTimeout(saveTimeout.current);
		saveTimeout.current = setTimeout(save, 1000);
	};

	const save = async () => {
		await api.db.asScript.updateContent(asScript, content.current);
		asScript.content = content.current;
		onSave && onSave(asScript);
		setSaving(false);
	};

	return (
		<>
			<div
				className="flex flex-col h-[500px] relative"
				onKeyDown={async event => {
					if (event.ctrlKey && event.key === 's') {
						event.preventDefault();
						setSaving(true);
						if (saveTimeout.current) clearTimeout(saveTimeout.current);
						saveTimeout.current = setTimeout(save, 1000);
					}
				}}
			>
				<LineInterface
					handleChange={handleChange}
					initialContent={asScript.content}
				/>
			</div>
			{saving ? 'Saving...' : 'Saved'}
		</>
	);
};

export default AsScript;
