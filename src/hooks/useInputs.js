import {useCallback, useState} from 'react';

export const useInputs = initialForm => {
	const [form, setForm] = useState(initialForm);

	const onChange = useCallback(
		obj => {
			setForm({...form, [obj.name]: obj.value});
		},
		[form]
	);

	const onChangeWrapper = useCallback(
		param => e => {
			onChange({name: param, value: e.value});
		},
		[onChange]
	);

	const reset = useCallback(() => setForm(initialForm), [initialForm]);

	return [form, onChangeWrapper, reset];
};
