export function MapUserFormToResource(userform: any) {
    return {
        empId: userform?.empId,
        name: userform?.name,
        email: userform?.email,
        designation: userform?.designation,
        reportingTo: userform?.reportingTo.join(","),
        billable: userform?.billable === 'yes',
        skill: userform?.skill.join(","),
        project: userform?.project.join(","),
        location: userform?.location,
        doj: userform?.doj,
        remarks: userform?.remarks,
    }
}