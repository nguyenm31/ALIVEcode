import { RouteComponentProps } from 'react-router-dom';

type RouteProps = {
  id: string;
};

export interface CourseProps extends RouteComponentProps<RouteProps> {};
