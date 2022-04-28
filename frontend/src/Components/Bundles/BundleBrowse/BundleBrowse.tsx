import { useState } from 'react';
import LoadingScreen from '../../UtilsComponents/LoadingScreen/LoadingScreen';
import BrowsingMenu from '../../MainComponents/BrowsingMenu/BrowsingMenu';
import { BrowsingResults } from '../../MainComponents/BrowsingMenu/browsingMenuTypes';
import api from '../../../Models/api';
import { useTranslation } from 'react-i18next';
import { Bundle } from '../../../Models/Course/bundles/bundle.entity';
import BundleCard from '../BundleCard/BundleCard';

/**
 * Browsing menu that shows all the bundles sorted with a query
 *
 * @author Enric Soldevila
 */
const BundleBrowse = () => {
	const [browsingResult, setBrowsingResult] =
		useState<BrowsingResults<Bundle>>();
	const bundles = browsingResult?.results;

	const { t } = useTranslation();

	return (
		<div className="p-4 relative">
			<div className="text-3xl mb-4">{t('bundle.browse.title')}</div>
			<div>
				<BrowsingMenu<Bundle>
					fetchOnSubmit
					apiRequest={api.db.bundles.query}
					onChange={res => setBrowsingResult(res)}
				/>
				<div className="!bg-[color:var(--background-color)] rounded-b-xl grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-4 justify-items-center p-4 tablet:p-8 laptop:p-12 desktop:p-14">
					{!bundles ? (
						<LoadingScreen relative />
					) : (
						<>
							{bundles.map((b, idx) => (
								<BundleCard
									onSelect={async b => await api.db.bundles.claimBundle(b.id)}
									bundle={b}
									key={idx}
								/>
							))}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default BundleBrowse;
