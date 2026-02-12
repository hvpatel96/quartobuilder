import { BlockList } from './BlockList';
import { useReport } from '../../contexts/ReportContext';

export const ReportEditor = () => {
    const { blocks } = useReport();

    return (
        <div className="pb-20">
            <BlockList blocks={blocks} />
        </div>
    );
};
