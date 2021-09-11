/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { loadObj } from './utils';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Course } from './Course/course.entity';
import { Section } from './Course/section.entity';
import { Classroom } from './Classroom/classroom.entity';
import { Professor, Student } from './User/user.entity';
import { IoTProject } from './Iot/IoTproject.entity';
import { IotRoute } from './Iot/IoTroute.entity';
import { IoTObject } from './Iot/IoTobject.entity';

type urlArgType<S extends string> = S extends `${infer _}:${infer A}/${infer B}`
	? A | urlArgType<B>
	: S extends `${infer _}:${infer A}`
	? A
	: never;

const formatUrl = <S extends string>(
	url: string,
	args: { [key in urlArgType<S>]: string },
) => {
	return url
		.split('/')
		.map(part =>
			part.startsWith(':') ? args[part.substring(1) as urlArgType<S>] : part,
		)
		.join('/');
};

const apiGet = <T extends {}, S extends string, U extends boolean>(
	url: S,
	target: ClassConstructor<T>,
	returnsArray: U,
) => {
	return async (args: { [key in urlArgType<S>]: string }) => {
		return (await loadObj(formatUrl(url, args), target)) as U extends true
			? T[]
			: T;
	};
};

const apiDelete = <S extends string>(url: S) => {
	return async (args: { [key in urlArgType<S>]: string }) => {
		return await axios.delete(formatUrl(url, args));
	};
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiCreate = <T>(moduleName: string, target: ClassConstructor<T>) => {
	return async (fields: any): Promise<T> => {
		const data = (await axios.post(moduleName, fields)).data;
		return plainToClass(target, data) as T;
	};
};

const apiUpdate = <T, S extends string>(
	url: S,
	target: ClassConstructor<T>,
) => {
	return async (
		args: { [key in urlArgType<S>]: string },
		fields: object,
	): Promise<T> => {
		const data = (await axios.patch(formatUrl(url, args), fields)).data;
		return plainToClass(target, data) as T;
	};
};

/*
const api = {
	db: {
		users: {
			iot: {
				async getProjects() {
					return (await axios.get(`users/iot/projects`)).data.map((d: any) =>
						plainToClass(IoTProject, d),
					);
				},
				async getObjects() {
					return (await axios.get(`users/iot/objects`)).data.map((d: any) =>
						plainToClass(IoTObject, d),
					);
				},
			},
			//get: apiGetter('users', User),
			async getClassrooms(userId: string) {
				return (await axios.get(`users/${userId}/classrooms`)).data;
			},
			getCourses(userId: string) {},
			createProfessor() {},
			createStudent() {},
		},
		classrooms: {
			async get(classroomId: string) {
				return plainToClass(
					Classroom,
					(await axios.get(`classrooms/${classroomId}`)).data,
				);
			},
			async getStudents(classroomId: string) {
				return (await axios.get(`classrooms/${classroomId}/students`)).data.map(
					(d: any) => plainToClass(Student, d),
				);
			},
			async getCourses(classroomId: string) {
				return (await axios.get(`classrooms/${classroomId}/courses`)).data.map(
					(d: any) => plainToClass(Course, d),
				);
			},
			create() {},
		},
		courses: {
			async get(courseId: string) {
				return plainToClass(
					Course,
					(await axios.get(`courses/${courseId}`)).data,
				);
			},
			async getSections(courseId: string) {
				return (await axios.get(`courses/${courseId}/sections`)).data.map(
					(d: any) => plainToClass(Section, d),
				);
			},
		},
		iot: {
			projects: {
				async get(projectId: string) {
					return plainToClass(
						IoTProject,
						(await axios.get(`iot/projects/${projectId}`)).data,
					);
				},
				async getRoutes(projectId: string) {
					return (await axios.get(`iot/projects/${projectId}/routes`)).data.map(
						(d: any) => plainToClass(IotRoute, d),
					);
				},
			},
		},
	},
};
*/

const api = {
	db: {
		users: {
			iot: {
				getProjects: apiGet('users/:id/iot/projects', IoTProject, true),
				getObjects: apiGet('users/:id/iot/objects', IoTObject, true),
			},
			//get: apiGetter('users', User),
			getClassrooms: apiGet('users/:id/classrooms', Classroom, true),
			getCourses: apiGet('users/:id/courses', Course, true),
			createProfessor: apiCreate('users/professors', Professor),
			createStudent: apiCreate('users/students', Student),
			delete: apiDelete('users/:id'),
		},
		classrooms: {
			get: apiGet('classrooms/:id/', Classroom, false),
			getCourses: apiGet('classrooms/:id/courses', Course, true),
			getStudents: apiGet('classrooms/:id/students', Student, true),
			create: apiCreate('classrooms', Classroom),
			delete: apiDelete('classrooms/:id'),
		},
		courses: {
			get: apiGet('courses/:id', Course, false),
			getSections: apiGet('courses/:id/sections', Section, true),
			delete: apiDelete('courses/:id'),
		},
		iot: {
			projects: {
				get: apiGet('iot/projects/:id', IoTProject, false),
				getRoutes: apiGet('iot/projects/:id/routes', IotRoute, true),
			},
		},
	},
};

export default api;
