package models

import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.{JsPath, Json, OFormat, Reads}
import play.api.libs.functional.syntax._


object OrderElement {

  case class OrderElement(name: String, age: Int, color: String, size: String)

  implicit val orderFormat: OFormat[OrderElement] = Json.format[OrderElement]

  implicit val jsonReads: Reads[OrderElement] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "age").read[Int] and
      (JsPath \ "color").read[String] and
      (JsPath \ "size").read[String]
    )(OrderElement.apply _)


  val orderElementForm = Form(
    mapping(
      "name" -> text,
      "age" -> number,
      "color" -> text,
      "size" -> text,
    )(OrderElement.apply)(OrderElement.unapply)
  )
}