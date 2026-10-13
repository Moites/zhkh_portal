namespace ZhkhPortal.Api.Domain;

public enum UserRole { citizen = 0, worker = 1, admin = 2 }
public enum RequestStatus { New = 0, Assigned = 1, InProgress = 2, Completed = 3, Rejected = 4 }
public enum RequestPriority { Low = 0, Medium = 1, High = 2, Emergency = 3 }
public enum RequestComplexity { Simple = 0, Medium = 1, Complex = 2 }
public enum SpecializationType { General = 0, Plumber = 1, Electrician = 2, Carpenter = 3, Painter = 4, Cleaner = 5, Janitor = 6, Roofer = 7, Locksmith = 8 }