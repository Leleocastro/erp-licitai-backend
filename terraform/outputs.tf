output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs das subnets publicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs das subnets de banco"
  value       = aws_subnet.database[*].id
}

output "nat_gateway_ip" {
  description = "IP elastico do NAT Gateway"
  value       = aws_eip.nat[0].public_ip
}
