import React, { useCallback } from 'react'
import { Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { getModel } from 'model'
 
function PreviewButton() {
  const navigate = useNavigate()

  const preparePreview = useCallback(() => {
    const { projectModel } = getModel()
    const currentPageId = projectModel.currentDocument?.id ?? Array.from(projectModel.documents)[0][0]
    navigate(`/preview/${currentPageId}`)
  }, [])

  return (
    <Button type="link" onClick={preparePreview}>
      预览
    </Button>
  )
}

export default PreviewButton