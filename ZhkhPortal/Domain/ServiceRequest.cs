namespace ZhkhPortal.Api.Domain
{
    public class ServiceRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime DoneAt { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        
        public RequestStatus Status { get; set; } = RequestStatus.New;
        public RequestPriority Priority { get; set; } = RequestPriority.Medium;
        public RequestComplexity Complexity { get; set; } = RequestComplexity.Simple;
        public SpecializationType? Specialization { get; set; } = SpecializationType.General;

        public Guid AuthorId { get; set; }
        public User? Author { get; set; }

        public Guid? AssignedWorkerId { get; set; }
        public User? AssignedWorker { get; set; }
    }
}