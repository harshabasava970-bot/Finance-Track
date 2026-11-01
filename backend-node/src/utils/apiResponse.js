const success = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Error', statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

const paginated = (res, content, pageNumber, pageSize, totalElements, totalPages) =>
  res.status(200).json({
    success: true,
    message: 'Success',
    data: { content, pageNumber, pageSize, totalElements, totalPages, last: pageNumber >= totalPages - 1 },
  });

module.exports = { success, error, paginated };
